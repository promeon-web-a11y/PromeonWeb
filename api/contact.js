// ==============================================================
//  お問い合わせ受信 API（Vercel サーバーレス関数）
// --------------------------------------------------------------
//  フロー：
//    /contact/ のフォーム
//      → POST /api/contact（このファイル：Vercel Serverless Function）
//      → Resend API（https://api.resend.com/emails）
//      → satokazu.promeon@gmail.com（To 固定）
//
//  秘密情報は環境変数からのみ読み込みます（フロントには一切出しません）。
//    RESEND_API_KEY      … Resend の API キー（re_xxx）              ← 必須
//    CONTACT_TO_EMAIL    … 届け先。未設定なら下の既定アドレス        ← 任意
//    CONTACT_FROM_EMAIL  … 差出人。未設定なら Resend テスト用アドレス ← 任意
//
//  レスポンスは Node 標準の res で書き出しています
//  （vite.config.js の開発用プラグインからも同じ関数を呼び出すため）。
// ==============================================================

// To の既定値（秘密情報ではありません。公開サイトにも記載のあるアドレス）。
// CONTACT_TO_EMAIL を設定すればそちらが優先されます。
const DEFAULT_TO_EMAIL = "satokazu.promeon@gmail.com";
// From の既定値。Resend が用意する共有送信元で、ドメイン認証なしで使えます。
// ※ @gmail.com などを From に指定すると Resend は送信を拒否します。ここは変更しないでください。
const DEFAULT_FROM_EMAIL = "Promeon Web <onboarding@resend.dev>";
const MAIL_SUBJECT = "【Promeon Web】新しいお問い合わせ";

const MAX = {
  name: 100,
  company: 120,
  email: 200,
  category: 60,
  hasSite: 10,
  siteUrl: 300,
  budget: 40,
  deadline: 40,
  message: 5000,
};

const CATEGORY_OPTIONS = [
  "新しくWebサイトを作りたい",
  "現在のWebサイトをリニューアルしたい",
  "Webサイトの一部を修正したい",
  "料金・見積もりについて相談したい",
  "Miniプランについて",
  "Standardプランについて",
  "Proプランについて",
  "オーダーメイド制作について",
  "その他",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+/i;
// 制御文字（タブ 0x09・改行 0x0A/0x0D は残す）を除去するための正規表現
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// 同一インスタンスでの連続送信をゆるく抑制（ベストエフォート）
const recent = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 3;

const FAIL_MESSAGE = "送信に失敗しました。時間をおいて再度お試しください。";

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  // success と ok の両方を返す（フロントはどちらで判定してもよい）
  const withFlags =
    typeof obj.ok === "boolean" ? { success: obj.ok, ...obj } : obj;
  res.end(JSON.stringify(withFlags));
}

async function readBody(req) {
  // Vercel は application/json を自動パースして req.body に入れる
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  // 生の Node ストリーム（ローカル開発時）
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// 前後空白の除去＋制御文字（タブ・改行は残す）を落とす。危険な入力への基本対策。
function str(v) {
  if (typeof v !== "string") return "";
  return v.replace(CONTROL_RE, "").trim();
}

// 1行用（改行・タブも除去）。メールアドレスなど1行で扱う値向け。
function oneLine(v) {
  return str(v)
    .replace(/[\r\n\t]+/g, " ")
    .trim();
}

export default async function handler(req, res) {
  // CORS プリフライト（基本は同一オリジンなので発生しないが念のため）
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, GET, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }

  // 動作確認用：GET は設定状況だけ返す（秘密情報は返さない）
  if (req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      endpoint: "/api/contact",
      runtime: "vercel-serverless",
      configured: Boolean(process.env.RESEND_API_KEY),
      to: process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL,
      toOverridden: Boolean(process.env.CONTACT_TO_EMAIL),
      from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL,
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, GET, OPTIONS");
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  let data;
  try {
    data = await readBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: "invalid_body" });
  }

  // --- スパム対策：ハニーポット（人には見えない項目）---
  if (str(data.website) !== "" || str(data.company_url_confirm) !== "") {
    console.warn("[contact] honeypot hit -> dropped");
    return sendJson(res, 200, { ok: true, dropped: true });
  }

  // --- スパム対策：フォーム表示から送信までの経過時間 ---
  const elapsed = Number(data.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 2000) {
    console.warn("[contact] submitted too fast -> dropped");
    return sendJson(res, 200, { ok: true, dropped: true });
  }

  // --- 入力の取り出し ---
  const name = str(data.name);
  const company = str(data.company);
  const email = oneLine(data.email);
  const category = str(data.category);
  const hasSite = str(data.hasSite);
  const siteUrl = oneLine(data.siteUrl);
  const budget = str(data.budget);
  const deadline = str(data.deadline);
  const message = str(data.message);
  const privacy =
    data.privacy === true || data.privacy === "true" || data.privacy === "on";

  // --- 必須・形式チェック（サーバー側でも必ず実施）---
  const errors = {};
  if (!name) errors.name = "お名前を入力してください。";
  if (!email) errors.email = "メールアドレスを入力してください。";
  else if (!EMAIL_RE.test(email))
    errors.email = "メールアドレスの形式が正しくありません。";
  if (!category) errors.category = "ご相談内容を選択してください。";
  else if (!CATEGORY_OPTIONS.includes(category))
    errors.category = "ご相談内容の選択が正しくありません。";
  if (hasSite === "はい" && siteUrl && !URL_RE.test(siteUrl)) {
    errors.siteUrl =
      "URLの形式が正しくありません（https:// から始まる形式でご入力ください）。";
  }
  if (!message) errors.message = "ご相談・お問い合わせ内容を入力してください。";
  if (!privacy) errors.privacy = "プライバシーポリシーへの同意が必要です。";

  for (const [key, limit] of Object.entries(MAX)) {
    const value = str(data[key]);
    if (value.length > limit) errors[key] = errors[key] || "入力が長すぎます。";
  }

  if (Object.keys(errors).length > 0) {
    return sendJson(res, 422, { ok: false, error: "validation", fields: errors });
  }

  // --- レート制限（ベストエフォート）---
  const ip = clientIp(req);
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    return sendJson(res, 429, {
      ok: false,
      error: "rate_limited",
      message: "送信が続けて行われました。少し時間をおいてからお試しください。",
    });
  }
  hits.push(now);
  recent.set(ip, hits);

  // --- 送信に必要な設定 ---
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  // API キーが無いと実際の送信はできない。「見た目だけ成功」にはしない。
  if (!apiKey) {
    console.error(
      "[contact] RESEND_API_KEY is not set. Add it to Vercel > Settings > Environment Variables (Production & Preview) and redeploy."
    );
    return sendJson(res, 500, {
      ok: false,
      error: "not_configured",
      message: FAIL_MESSAGE,
    });
  }

  // --- メール本文（プレーンテキスト送信：HTML は解釈されません）---
  const sentAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const lines = [
    "Promeon Web サイトのお問い合わせフォームから送信がありました。",
    "",
    `お名前：${name}`,
    `会社名・屋号：${company || "（未入力）"}`,
    `メールアドレス：${email}`,
    `お問い合わせ種別：${category}`,
    `現在Webサイトを持っているか：${hasSite || "（未選択）"}`,
    `現在のWebサイトURL：${siteUrl || "（未入力）"}`,
    `ご予算：${budget || "（未選択）"}`,
    `希望納期：${deadline || "（未選択）"}`,
    "",
    "▼ お問い合わせ内容",
    message,
    "",
    "----",
    `送信日時：${sentAt}`,
    `送信元IP：${ip}`,
  ];

  // --- Resend でメール送信 ---
  console.log(
    `[contact] sending via Resend (from="${from}", to="${to}", reply_to="${email}")`
  );
  let resp;
  let raw = "";
  try {
    resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email, // 問い合わせ者へ返信しやすいように
        subject: MAIL_SUBJECT,
        text: lines.join("\n"),
      }),
    });
    raw = await resp.text().catch(() => "");
  } catch (err) {
    console.error("[contact] fetch to Resend threw:", err && err.message);
    return sendJson(res, 502, {
      ok: false,
      error: "send_failed",
      stage: "fetch",
      message: FAIL_MESSAGE,
    });
  }

  let parsed = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* 空 or 非 JSON */
  }

  if (!resp.ok) {
    // 秘密情報（APIキー等）はブラウザへ返さない。
    // Resend の HTTP ステータスとエラー名だけは、原因調査用にレスポンス・ログへ含める。
    const resendCode = parsed && (parsed.name || parsed.error || "");
    const resendMsg = parsed && parsed.message ? String(parsed.message) : raw;
    console.error(
      `[contact] Resend error: status=${resp.status} name=${resendCode} message=${resendMsg}`
    );
    return sendJson(res, 502, {
      ok: false,
      error: "send_failed",
      stage: "resend",
      detail: { resendStatus: resp.status, resendCode: String(resendCode || "") },
      message: FAIL_MESSAGE,
    });
  }

  const sentId = (parsed && parsed.id) || "";
  console.log(`[contact] sent OK (Resend id=${sentId || "unknown"})`);
  return sendJson(res, 200, { ok: true, id: sentId });
}

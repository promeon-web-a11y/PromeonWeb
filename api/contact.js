// ==============================================================
//  お問い合わせ受信 API（Vercel サーバーレス関数）
// --------------------------------------------------------------
//  フロー：
//    /contact/ のフォーム
//      → POST /api/contact（このファイル：Vercel Serverless Function）
//      → メール送信（下記のどちらか）
//          1) RESEND_API_KEY があれば Resend で送信（推奨）
//          2) 無ければ FormSubmit（https://formsubmit.co）で送信（APIキー不要）
//      → satokazu.promeon@gmail.com（To 固定）
//
//  秘密情報は環境変数からのみ読み込みます（フロントには一切出しません）。
//    RESEND_API_KEY      … Resend の API キー（re_xxx）。無くても FormSubmit で動作 ← 任意
//    CONTACT_TO_EMAIL    … 届け先。未設定なら下の既定アドレス                     ← 任意
//    CONTACT_FROM_EMAIL  … Resend 使用時の差出人。未設定なら Resend テスト用       ← 任意
//
//  ★ FormSubmit は「そのメールアドレス宛の初回送信」で確認メールを1通送ります。
//     受信箱に届く FormSubmit の確認リンクを1度クリックすれば、以降ずっと転送されます。
// ==============================================================

// To の既定値（秘密情報ではありません。公開サイトにも記載のあるアドレス）。
const DEFAULT_TO_EMAIL = "satokazu.promeon@gmail.com";
// Resend 使用時の From 既定値（Resend 共有送信元。@gmail.com を From にすると拒否されます）。
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
  const withFlags =
    typeof obj.ok === "boolean" ? { success: obj.ok, ...obj } : obj;
  res.end(JSON.stringify(withFlags));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
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

function str(v) {
  if (typeof v !== "string") return "";
  return v.replace(CONTROL_RE, "").trim();
}

function oneLine(v) {
  return str(v)
    .replace(/[\r\n\t]+/g, " ")
    .trim();
}

// ---- Resend 経由の送信 --------------------------------------------------------
async function sendViaResend({ apiKey, from, to, replyTo, subject, text }) {
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
        reply_to: replyTo,
        subject,
        text,
      }),
    });
    raw = await resp.text().catch(() => "");
  } catch (err) {
    return {
      ok: false,
      via: "resend",
      stage: "fetch",
      status: 0,
      code: String((err && err.message) || "fetch_error"),
    };
  }
  let parsed = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* 空 or 非 JSON */
  }
  if (!resp.ok) {
    return {
      ok: false,
      via: "resend",
      stage: "resend",
      status: resp.status,
      code: String((parsed && (parsed.name || parsed.error)) || ""),
      message: (parsed && parsed.message) || raw,
    };
  }
  return { ok: true, via: "resend", id: (parsed && parsed.id) || "" };
}

// ---- FormSubmit 経由の送信（APIキー不要）------------------------------------
// FormSubmit の AJAX エンドポイントは、送信元サイトを識別するため Referer/Origin を要求します。
// ブラウザ → /api/contact のリクエストに付く Referer/Origin をそのまま中継します。
async function sendViaFormsubmit({ to, replyTo, name, subject, text, siteUrl }) {
  const url = `https://formsubmit.co/ajax/${to}`;
  const origin = (() => {
    try {
      return new URL(siteUrl).origin;
    } catch {
      return siteUrl || "";
    }
  })();
  let resp;
  let raw = "";
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; PromeonWebContact/1.0; +https://formsubmit.co)",
        ...(siteUrl ? { Referer: siteUrl } : {}),
        ...(origin ? { Origin: origin } : {}),
      },
      body: JSON.stringify({
        name,
        email: replyTo, // FormSubmit はこれを Reply-To に使う
        _subject: subject,
        _template: "table",
        _captcha: "false",
        message: text,
      }),
    });
    raw = await resp.text().catch(() => "");
  } catch (err) {
    return {
      ok: false,
      via: "formsubmit",
      stage: "fetch",
      status: 0,
      code: String((err && err.message) || "fetch_error"),
    };
  }
  let parsed = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* 非 JSON */
  }
  const succeeded = parsed && String(parsed.success) === "true";
  if (resp.ok && succeeded) {
    return { ok: true, via: "formsubmit", id: "" };
  }
  const msg = String((parsed && parsed.message) || raw || "");
  const needsActivation = /activat|confirm|verify/i.test(msg);
  return {
    ok: false,
    via: "formsubmit",
    stage: needsActivation ? "activation_required" : "formsubmit",
    status: resp.status,
    code: needsActivation ? "activation_required" : "send_failed",
    message: msg,
  };
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, GET, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }

  // 動作確認用：GET は設定状況だけ返す（秘密情報は返さない）
  if (req.method === "GET") {
    const useResend = Boolean(process.env.RESEND_API_KEY);
    return sendJson(res, 200, {
      ok: true,
      endpoint: "/api/contact",
      runtime: "vercel-serverless",
      method: useResend ? "resend" : "formsubmit",
      resendConfigured: useResend,
      to: process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL,
      from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      note: useResend
        ? "Resend で送信します。"
        : "FormSubmit で送信します。初回のみ届け先メールに届く確認リンクのクリックが必要です。",
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

  // --- スパム対策：ハニーポット ---
  if (str(data.website) !== "" || str(data.company_url_confirm) !== "") {
    console.warn("[contact] honeypot hit -> dropped");
    return sendJson(res, 200, { ok: true, dropped: true });
  }

  // --- スパム対策：送信までの経過時間 ---
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

  // --- 送信設定 ---
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  // 送信元サイトの URL（FormSubmit の識別用）。ブラウザの Referer / Origin、
  // 無ければ Host ヘッダから組み立てる。
  const proto =
    (req.headers["x-forwarded-proto"] || "").toString().split(",")[0] || "https";
  const sourceUrl =
    oneLine(req.headers.referer) ||
    oneLine(req.headers.origin) ||
    (req.headers.host ? `${proto}://${req.headers.host}/contact/` : "");

  const sentAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const text = [
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
  ].join("\n");

  // Resend キーがあれば Resend、無ければ FormSubmit
  let result;
  if (apiKey) {
    console.log(`[contact] sending via Resend (to="${to}", reply_to="${email}")`);
    result = await sendViaResend({
      apiKey,
      from,
      to,
      replyTo: email,
      subject: MAIL_SUBJECT,
      text,
    });
  } else {
    console.warn(
      "[contact] RESEND_API_KEY not set -> sending via FormSubmit (no API key needed)"
    );
    result = await sendViaFormsubmit({
      to,
      replyTo: email,
      name,
      subject: MAIL_SUBJECT,
      text,
      siteUrl: sourceUrl,
    });
  }

  if (!result.ok) {
    console.error(
      `[contact] send failed: via=${result.via} stage=${result.stage} status=${result.status} code=${result.code} message=${result.message || ""}`
    );
    const activation = result.code === "activation_required";
    return sendJson(res, activation ? 503 : 502, {
      ok: false,
      error: activation ? "activation_required" : "send_failed",
      stage: result.stage || null,
      detail: {
        via: result.via,
        status: result.status || null,
        code: result.code || null,
      },
      message: FAIL_MESSAGE,
    });
  }

  console.log(
    `[contact] sent OK: via=${result.via} id=${result.id || "-"} to=${to}`
  );
  return sendJson(res, 200, { ok: true, via: result.via, id: result.id || "" });
}

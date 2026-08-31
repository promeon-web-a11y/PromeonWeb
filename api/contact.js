// ==============================================================
//  お問い合わせ受信 API（Vercel サーバーレス関数）
// --------------------------------------------------------------
//  役割：/contact/ ページのフォームから送られた内容を検証し、
//        メール送信サービス「Resend」経由で管理者宛メールに変換する。
//
//  秘密情報はすべて環境変数から読み込みます（フロントには一切出しません）。
//    RESEND_API_KEY     … Resend の API キー（re_xxx）
//    CONTACT_TO_EMAIL   … 問い合わせの届け先（例：自分の Gmail）
//    CONTACT_FROM_EMAIL … 差出人（任意。未設定なら Resend のテスト用アドレス）
//
//  ローカルでも動くよう、レスポンスは Node 標準の res で書き出しています
//  （vite.config.js の開発用プラグインからも同じ関数を呼び出します）。
// ==============================================================

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

// 同一インスタンスでの連続送信をゆるく抑制（ベストエフォート）
const recent = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 3;

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
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

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  let data;
  try {
    data = await readBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: "invalid_body" });
  }

  // --- スパム対策：ハニーポット（人間には見えない項目）---
  // 値が入っていたら Bot とみなし、成功したように見せて破棄する。
  if (str(data.website) !== "" || str(data.company_url_confirm) !== "") {
    return sendJson(res, 200, { ok: true });
  }

  // --- スパム対策：フォーム表示から送信までの経過時間 ---
  const elapsed = Number(data.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 2000) {
    return sendJson(res, 200, { ok: true });
  }

  // --- 入力の取り出し ---
  const name = str(data.name);
  const company = str(data.company);
  const email = str(data.email);
  const category = str(data.category);
  const hasSite = str(data.hasSite);
  const siteUrl = str(data.siteUrl);
  const budget = str(data.budget);
  const deadline = str(data.deadline);
  const message = str(data.message);
  const privacy = data.privacy === true || data.privacy === "true" || data.privacy === "on";

  // --- 必須・形式チェック（サーバー側でも必ず実施）---
  const errors = {};
  if (!name) errors.name = "お名前を入力してください。";
  if (!email) errors.email = "メールアドレスを入力してください。";
  else if (!EMAIL_RE.test(email)) errors.email = "メールアドレスの形式が正しくありません。";
  if (!category) errors.category = "ご相談内容を選択してください。";
  else if (!CATEGORY_OPTIONS.includes(category)) errors.category = "ご相談内容の選択が正しくありません。";
  if (hasSite === "はい" && siteUrl && !URL_RE.test(siteUrl)) {
    errors.siteUrl = "URLの形式が正しくありません（https:// から始まる形式でご入力ください）。";
  }
  if (!message) errors.message = "ご相談・お問い合わせ内容を入力してください。";
  if (!privacy) errors.privacy = "プライバシーポリシーへの同意が必要です。";

  // 文字数上限（不正な巨大入力への対策）
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

  // --- 環境変数の確認（未設定なら「見た目だけ成功」にはしない）---
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Promeon Web <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.error(
      "[contact] 環境変数が未設定です。RESEND_API_KEY と CONTACT_TO_EMAIL を設定してください。"
    );
    return sendJson(res, 500, {
      ok: false,
      error: "not_configured",
      message: "送信に失敗しました。時間をおいて再度お試しください。",
    });
  }

  // --- メール本文の組み立て ---
  const lines = [
    "Promeon Web サイトのお問い合わせフォームから送信がありました。",
    "",
    `お名前：${name}`,
    `会社名・屋号：${company || "（未入力）"}`,
    `メールアドレス：${email}`,
    `ご相談内容：${category}`,
    `現在Webサイトを持っているか：${hasSite || "（未選択）"}`,
    `現在のWebサイトURL：${siteUrl || "（未入力）"}`,
    `ご予算：${budget || "（未選択）"}`,
    `希望納期：${deadline || "（未選択）"}`,
    "",
    "▼ ご相談・お問い合わせ内容",
    message,
    "",
    "----",
    `送信日時：${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
    `送信元IP：${ip}`,
  ];

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `【お問い合わせ】${name} 様（${category}）`,
        text: lines.join("\n"),
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      console.error("[contact] Resend API エラー:", resp.status, detail);
      return sendJson(res, 502, {
        ok: false,
        error: "send_failed",
        message: "送信に失敗しました。時間をおいて再度お試しください。",
      });
    }
  } catch (err) {
    console.error("[contact] 送信時に例外:", err);
    return sendJson(res, 502, {
      ok: false,
      error: "send_failed",
      message: "送信に失敗しました。時間をおいて再度お試しください。",
    });
  }

  return sendJson(res, 200, { ok: true });
}

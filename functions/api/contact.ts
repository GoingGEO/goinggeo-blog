/**
 * Cloudflare Pages Function — Contact Form Handler
 *
 * Receives POST from the About page contact form,
 * sends an email via Resend API to the site owner.
 *
 * Required environment variables (set in Cloudflare Pages dashboard):
 *   RESEND_API_KEY — Resend.com API key (free tier: 100 emails/day)
 *
 * Anti-spam: honeypot field "website" must be empty.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://goinggeo.com",
  "https://www.goinggeo.com",
  "http://localhost:4321",
];

function json(data: unknown, status = 200, origin?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return new Response(JSON.stringify(data), { status, headers });
}

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, string>;
}) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || undefined;

  // Check if Resend API key is configured
  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY environment variable is not set");
    return json(
      { success: false, message: "服务器邮件服务未配置，请联系站长。" },
      500,
      origin
    );
  }

  let body: {
    name?: string;
    email?: string;
    message?: string;
    website?: string; // honeypot
  };

  try {
    body = await request.json();
  } catch {
    return json(
      { success: false, message: "请求数据格式错误。" },
      400,
      origin
    );
  }

  // Honeypot check — if "website" field is filled, it's a bot
  if (body.website) {
    // Pretend success to not tip off the bot
    return json({ success: true, message: "提交成功！" }, 200, origin);
  }

  // Validate required fields
  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return json(
      { success: false, message: "请填写所有必填字段。" },
      400,
      origin
    );
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json(
      { success: false, message: "邮箱地址格式不正确。" },
      400,
      origin
    );
  }

  // Length limits
  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return json(
      { success: false, message: "输入内容过长，请精简后重试。" },
      400,
      origin
    );
  }

  // Send email via Resend API
  try {
    const emailResponse = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GoingGEO 联系表单 <noreply@goinggeo.com>",
        to: "info@im28.net",
        reply_to: email,
        subject: `[GoingGEO 联系表单] ${name} 的留言`,
        text: [
          `姓名: ${name}`,
          `邮箱: ${email}`,
          ``,
          `留言内容:`,
          message,
          ``,
          `---`,
          `发送时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
          `来源: ${request.headers.get("referer") || "unknown"}`,
        ].join("\n"),
        html: [
          `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">`,
          `<h2 style="color: #2563eb; border-bottom: 2px solid #e5e5ea; padding-bottom: 10px;">GoingGEO 联系表单新留言</h2>`,
          `<table style="width: 100%; border-collapse: collapse;">`,
          `<tr><td style="padding: 8px 0; color: #6b7280; width: 80px;">姓名</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(name)}</td></tr>`,
          `<tr><td style="padding: 8px 0; color: #6b7280;">邮箱</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #2563eb;">${escapeHtml(email)}</a></td></tr>`,
          `</table>`,
          `<h3 style="margin-top: 20px; color: #1c1c1e;">留言内容</h3>`,
          `<div style="background: #f9fafb; border-radius: 8px; padding: 16px; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</div>`,
          `<hr style="border: none; border-top: 1px solid #e5e5ea; margin: 20px 0;">`,
          `<p style="color: #9ca3af; font-size: 12px;">发送时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}<br>来源: ${escapeHtml(request.headers.get("referer") || "unknown")}</p>`,
          `</div>`,
        ].join(""),
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", emailResponse.status, errorText);
      return json(
        { success: false, message: "邮件发送失败，请稍后重试或直接发邮件至 info@im28.net" },
        500,
        origin
      );
    }

    return json(
      { success: true, message: "提交成功！我们已收到您的留言，会尽快回复。" },
      200,
      origin
    );
  } catch (err) {
    console.error("Failed to send email:", err);
    return json(
      { success: false, message: "服务器错误，请稍后重试或直接发邮件至 info@im28.net" },
      500,
      origin
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions(context: {
  request: Request;
}) {
  const origin = context.request.headers.get("Origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return new Response(null, { status: 204, headers });
}

// Reject other methods
export async function onRequestGet() {
  return json({ error: "Method not allowed" }, 405);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

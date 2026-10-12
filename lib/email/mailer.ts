import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransport() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string) {
  const t = getTransport();
  if (!t) {
    console.warn(`[email] SMTP not configured. Skipped "${subject}" to ${to}`);
    return false;
  }
  await t.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, to, subject, html });
  return true;
}

const shell = (body: string) => `<div style="font-family:Inter,Arial,sans-serif;background:#07080c;color:#e6e8ef;padding:32px">
<div style="max-width:520px;margin:auto;background:#12151e;border:1px solid #1d2230;border-radius:12px;padding:28px">
<h2 style="margin:0 0 16px;color:#fff">CRYON61 STUDIO</h2>${body}
<p style="color:#7d8499;font-size:12px;margin-top:28px">© 2026 CRYON61 STUDIO</p></div></div>`;

const btn = (href: string, label: string) =>
  `<p><a href="${href}" style="display:inline-block;background:#7c5cff;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${label}</a></p>`;

export const mail = {
  verify: (to: string, url: string) => sendMail(to, "Verify your email", shell(`<p>Welcome! Confirm your email to activate your account.</p>${btn(url, "Verify email")}<p style="color:#7d8499;font-size:12px">Link expires in 24 hours.</p>`)),
  reset: (to: string, url: string) => sendMail(to, "Reset your password", shell(`<p>We received a password reset request.</p>${btn(url, "Reset password")}<p style="color:#7d8499;font-size:12px">Link expires in 1 hour. Ignore this email if it wasn't you.</p>`)),
};

import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.NOTIFY_EMAIL ?? "crementumteaching@gmail.com";
const from = process.env.NOTIFY_FROM ?? "Crementum <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : undefined;

type Notification = {
  subject: string;
  /** Ordered label/value pairs, rendered as a plain definition list. */
  rows: [string, string][];
  /** Set so the team can hit reply and land in the student's inbox. */
  replyTo?: string;
};

function renderText({ subject, rows }: Notification) {
  return [subject, "", ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n");
}

function renderHtml({ rows }: Notification) {
  const items = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5b6467;font:500 12px/1.4 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${escapeHtml(
          label,
        )}</td><td style="padding:6px 0;color:#161a1c;font:400 15px/1.55 Georgia,serif">${escapeHtml(
          value,
        ).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return `<table style="border-collapse:collapse;max-width:34rem">${items}</table>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sends the notification when a key is configured, and logs it otherwise.
 * Delivery is never allowed to fail a submission — the row is already saved,
 * and a dropped email is recoverable from the admin list.
 */
export async function notify(notification: Notification): Promise<void> {
  if (!resend) {
    console.info(
      `[crementum] RESEND_API_KEY not set — notification not sent:\n${renderText(notification)}`,
    );
    return;
  }

  try {
    await resend.emails.send({
      from,
      to,
      subject: notification.subject,
      text: renderText(notification),
      html: renderHtml(notification),
      ...(notification.replyTo ? { replyTo: notification.replyTo } : {}),
    });
  } catch (error) {
    console.error("[crementum] notification failed to send", error);
  }
}

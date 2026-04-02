import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from "./env";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured, skipping email:", options.subject);
    return;
  }

  try {
    // @ts-expect-error - Resend SDK has strict overloads that TypeScript can't resolve
    // when text/html are conditionally optional. This is a known limitation.
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      ...(options.text && { text: options.text }),
      ...(options.html && { html: options.html }),
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } catch (err) {
    console.error("Email sending error:", err);
    throw err;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  const subject = "Reset your SquidVault password";
  const text = `Hello,

You requested a password reset for your SquidVault account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

- SquidVault Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111827; margin-top: 0;">Reset your SquidVault password</h2>
    <p style="color: #4b5563;">Hello,</p>
    <p style="color: #4b5563;">You requested a password reset for your SquidVault account.</p>
    <p style="color: #4b5563;">Click the button below to reset your password. This link will expire in 1 hour.</p>
    <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 20px 0;">Reset Password</a>
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Or copy and paste this URL into your browser:<br>${resetUrl}</p>
    <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">- SquidVault Team</p>
</body>
</html>`;

  return sendEmail({ to: email, subject, text, html });
}

import type { EmailMessage } from '../email.provider.js';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  expiryMinutes: number;
}): EmailMessage {
  const safeUrl = escapeHtml(params.resetUrl);

  const html = `<!doctype html>
<html lang="en">
  <body style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 32px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 32px;">
      <tr>
        <td>
          <p style="font-size: 13px; font-weight: 700; letter-spacing: 0.06em; color: #4F46E5; margin: 0 0 12px;">LINKIUM</p>
          <h1 style="font-size: 22px; font-weight: 700; color: #0F172A; margin: 0 0 16px;">Reset your password</h1>
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
            We received a request to reset the password for your LINKIUM account. Use the button below to choose a new password.
          </p>
          <p style="margin: 0 0 24px;">
            <a href="${safeUrl}" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
              Reset Password
            </a>
          </p>
          <p style="font-size: 13px; line-height: 1.6; color: #64748B; margin: 0 0 8px;">
            If the button does not work, copy and paste this fallback link into your browser:
          </p>
          <p style="font-size: 12px; line-height: 1.5; word-break: break-all; color: #4F46E5; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin: 0 0 20px;">
            <a href="${safeUrl}" style="color: #4F46E5; text-decoration: underline;">${safeUrl}</a>
          </p>
          <p style="font-size: 13px; line-height: 1.6; color: #64748B; margin: 0 0 12px;">
            This password reset link expires in ${params.expiryMinutes} minutes and can only be used once.
          </p>
          <p style="font-size: 13px; line-height: 1.6; color: #64748B; margin: 0;">
            If you did not request a password reset, you can safely ignore this email. Your existing password remains unchanged.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    'LINKIUM — Reset your password',
    '',
    'Use the link below to reset your LINKIUM account password:',
    params.resetUrl,
    '',
    `This link expires in ${params.expiryMinutes} minutes and can only be used once.`,
    'If you did not request a password reset, you can safely ignore this email.',
  ].join('\n');

  return {
    to: params.to,
    subject: 'Reset your LINKIUM password',
    html,
    text,
  };
}

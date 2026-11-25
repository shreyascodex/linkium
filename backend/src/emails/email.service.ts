import { env } from '../config/env.js';
import type { EmailProvider, EmailSendResult } from './email.provider.js';
import { ConsoleEmailProvider } from './providers/console.provider.js';
import { ResendEmailProvider } from './providers/resend.provider.js';
import { buildPasswordResetEmail } from './templates/password-reset.template.js';
import { buildVerificationEmail } from './templates/verification.template.js';

function createEmailProvider(): EmailProvider {
  if (env.EMAIL_PROVIDER === 'resend') {
    return new ResendEmailProvider(env.EMAIL_API_KEY, env.EMAIL_FROM);
  }
  return new ConsoleEmailProvider();
}

export class EmailService {
  private provider: EmailProvider;

  constructor(provider?: EmailProvider) {
    this.provider = provider ?? createEmailProvider();
  }

  public setProvider(provider: EmailProvider): void {
    this.provider = provider;
  }

  public async sendVerificationEmail(
    to: string,
    rawToken: string
  ): Promise<EmailSendResult> {
    const verificationUrl = `${env.APP_BASE_URL}/verify-email?token=${encodeURIComponent(rawToken)}`;
    const message = buildVerificationEmail({
      to,
      verificationUrl,
      expiryMinutes: env.VERIFICATION_TOKEN_EXPIRY_MINUTES,
    });
    return this.provider.send(message);
  }

  public async sendPasswordResetEmail(
    to: string,
    rawToken: string
  ): Promise<EmailSendResult> {
    const resetUrl = `${env.APP_BASE_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
    const message = buildPasswordResetEmail({
      to,
      resetUrl,
      expiryMinutes: env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES,
    });
    return this.provider.send(message);
  }
}

export const emailService = new EmailService();

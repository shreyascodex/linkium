import { logger } from '../../config/logger.js';
import type { EmailMessage, EmailProvider, EmailSendResult } from '../email.provider.js';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export class ConsoleEmailProvider implements EmailProvider {
  public readonly name = 'console';

  public async send(message: EmailMessage): Promise<EmailSendResult> {
    // Log metadata only — never log raw authentication tokens or passwords
    logger.info(
      {
        emailProvider: this.name,
        to: maskEmail(message.to),
        subject: message.subject,
      },
      'Console email provider dispatched transactional email'
    );

    return {
      provider: this.name,
      messageId: `console-${Date.now()}`,
    };
  }
}

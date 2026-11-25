import { Resend } from 'resend';
import { logger } from '../../config/logger.js';
import { AppError } from '../../utils/api-response.js';
import type { EmailMessage, EmailProvider, EmailSendResult } from '../email.provider.js';

export class ResendEmailProvider implements EmailProvider {
  public readonly name = 'resend';
  private readonly client: Resend;
  private readonly fromAddress: string;

  constructor(apiKey: string, fromAddress: string) {
    if (!apiKey) {
      throw new Error('ResendEmailProvider requires a valid EMAIL_API_KEY.');
    }
    this.client = new Resend(apiKey);
    this.fromAddress = fromAddress;
  }

  public async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const response = await this.client.emails.send({
        from: this.fromAddress,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      });

      if (response.error) {
        logger.error(
          {
            emailProvider: this.name,
            errorName: response.error.name,
          },
          'Resend email delivery failed'
        );

        throw new AppError('Unable to deliver email right now. Please try again later.', 502, [
          {
            code: 'EMAIL_DELIVERY_FAILED',
            message: 'Transactional email provider returned an error.',
          },
        ]);
      }

      return {
        provider: this.name,
        messageId: response.data?.id,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(
        {
          emailProvider: this.name,
          errorName: error instanceof Error ? error.name : 'UnknownError',
        },
        'Resend email transport failed'
      );

      throw new AppError('Unable to deliver email right now. Please try again later.', 502, [
        {
          code: 'EMAIL_DELIVERY_FAILED',
          message: 'Transactional email provider could not be reached.',
        },
      ]);
    }
  }
}

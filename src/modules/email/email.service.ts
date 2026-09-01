import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Resend } from 'resend';
import { registrationConfirmationTemplate } from './templates/registration-confirmation.template';
import { dayRegistrationConfirmationTemplate } from './templates/day-registration-confirmation.template';
import { caConfirmationTemplate } from './templates/ca-confirmation.template';
import { allotmentConfirmationTemplate } from './templates/allotment-confirmation.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend?: Resend;
  private readonly gmailTransporter?: Transporter;
  private readonly gmailUser?: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }

    const gmailUser = process.env.GMAIL_SMTP_USER || process.env.EMAIL_USER;
    const gmailAppPassword =
      process.env.GMAIL_SMTP_APP_PASSWORD || process.env.EMAIL_PASS;

    if (gmailUser && gmailAppPassword) {
      this.gmailUser = gmailUser;
      this.gmailTransporter = nodemailer.createTransport({
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        maxConnections: 1,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });
    } else if (gmailUser || gmailAppPassword) {
      this.logger.warn(
        'Gmail SMTP fallback is disabled because its credentials are incomplete.',
      );
    }

    if (!this.resend && !this.gmailTransporter) {
      throw new Error(
        'Email delivery is not configured. Set RESEND_API_KEY or both GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD.',
      );
    }
  }

  private get resendFrom(): string {
    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
      throw new Error(
        'RESEND_FROM_EMAIL is required (e.g. "RJMUN 3.0 <noreply@rjmun-backend.shop>")',
      );
    }
    return from;
  }

  private get gmailFrom(): string {
    if (!this.gmailUser) {
      throw new Error('Gmail SMTP sender is not configured.');
    }

    return process.env.GMAIL_FROM_EMAIL || `RJMUN 3.0 <${this.gmailUser}>`;
  }

  private toError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return new Error(error.message);
    }

    return new Error('Email delivery failed.');
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<{ provider: 'resend' | 'gmail'; id?: string }> {
    let resendError: unknown;

    if (this.resend) {
      try {
        const { data, error } = await this.resend.emails.send({
          from: this.resendFrom,
          to,
          subject,
          html,
        });

        if (error) {
          throw this.toError(error);
        }

        return { provider: 'resend', id: data?.id };
      } catch (error: unknown) {
        resendError = error;
        if (this.gmailTransporter) {
          this.logger.warn(
            'Resend delivery failed; attempting Gmail SMTP fallback.',
          );
        }
      }
    }

    if (this.gmailTransporter) {
      await this.gmailTransporter.sendMail({
        from: this.gmailFrom,
        to,
        subject,
        html,
      });
      return { provider: 'gmail' };
    }

    if (resendError) {
      throw this.toError(resendError);
    }

    throw new Error('No email delivery provider is available.');
  }

  private async deliverBestEffort(
    emailType: string,
    delivery: () => Promise<unknown>,
  ): Promise<boolean> {
    try {
      await delivery();
      return true;
    } catch (error: unknown) {
      const deliveryError = this.toError(error);
      this.logger.error(
        `${emailType} email could not be delivered.`,
        deliveryError.stack,
      );
      return false;
    }
  }

  async sendRegistrationConfirmation(
    to: string,
    regId: string,
    fullName: string,
    registrationAmount: number,
  ) {
    const html = registrationConfirmationTemplate(
      fullName,
      regId,
      registrationAmount,
    );
    return this.sendEmail(to, 'RJMUN Registration Confirmation', html);
  }

  async trySendRegistrationConfirmation(
    to: string,
    regId: string,
    fullName: string,
    registrationAmount: number,
  ): Promise<boolean> {
    return this.deliverBestEffort('Registration confirmation', () =>
      this.sendRegistrationConfirmation(
        to,
        regId,
        fullName,
        registrationAmount,
      ),
    );
  }

  async sendDayRegistrationConfirmation(
    to: string,
    registrationId: string,
    firstName: string,
    selectedDaysSummary: string,
    daysWithActivities?: Array<{
      dayName: string;
      dayDate: string;
      activities: string[];
    }>,
  ) {
    const html = dayRegistrationConfirmationTemplate(
      firstName,
      registrationId,
      selectedDaysSummary,
      daysWithActivities,
    );
    return this.sendEmail(to, 'Fest Day Registration Confirmation', html);
  }

  async trySendDayRegistrationConfirmation(
    to: string,
    registrationId: string,
    firstName: string,
    selectedDaysSummary: string,
    daysWithActivities?: Array<{
      dayName: string;
      dayDate: string;
      activities: string[];
    }>,
  ): Promise<boolean> {
    return this.deliverBestEffort('Fest day registration confirmation', () =>
      this.sendDayRegistrationConfirmation(
        to,
        registrationId,
        firstName,
        selectedDaysSummary,
        daysWithActivities,
      ),
    );
  }

  async sendCAConfirmationEmail(
    to: string,
    fullName: string,
    institution: string,
  ) {
    const html = caConfirmationTemplate(fullName, institution);
    return this.sendEmail(to, 'RJMUN CA Registration Confirmation', html);
  }

  async trySendCAConfirmationEmail(
    to: string,
    fullName: string,
    institution: string,
  ): Promise<boolean> {
    return this.deliverBestEffort('CA registration confirmation', () =>
      this.sendCAConfirmationEmail(to, fullName, institution),
    );
  }

  async sendAllotmentEmail(
    to: string,
    fullName: string,
    committee: string,
    portfolio: string,
  ) {
    const html = allotmentConfirmationTemplate(fullName, committee, portfolio);
    return this.sendEmail(to, 'Your RJMUN Allotment Details', html);
  }
}

import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { registrationConfirmationTemplate } from './templates/registration-confirmation.template';
import { dayRegistrationConfirmationTemplate } from './templates/day-registration-confirmation.template';
import { caConfirmationTemplate } from './templates/ca-confirmation.template';
import { allotmentConfirmationTemplate } from './templates/allotment-confirmation.template';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required for sending emails');
    }
    this.resend = new Resend(apiKey);
  }

  private get from(): string {
    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
      throw new Error('RESEND_FROM_EMAIL is required (e.g. "RJMUN 3.0 <noreply@rjmun-backend.shop>")');
    }
    return from;
  }

  async sendRegistrationConfirmation(
    to: string,
    regId: string,
    fullName: string,
  ) {
    const html = registrationConfirmationTemplate(fullName, regId);
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'RJMUN Registration Confirmation',
      html,
    });
    if (error) throw error;
    return data;
  }

  async sendDayRegistrationConfirmation(
    to: string,
    registrationId: string,
    firstName: string,
    selectedDaysSummary: string,
  ) {
    const html = dayRegistrationConfirmationTemplate(
      firstName,
      registrationId,
      selectedDaysSummary,
    );
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Fest Day Registration Confirmation',
      html,
    });
    if (error) throw error;
    return data;
  }

  async sendCAConfirmationEmail(
    to: string,
    fullName: string,
    institution: string,
  ) {
    const html = caConfirmationTemplate(fullName, institution);
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'RJMUN CA Registration Confirmation',
      html,
    });
    if (error) throw error;
    return data;
  }

  async sendAllotmentEmail(
    to: string,
    fullName: string,
    committee: string,
    portfolio: string,
  ) {
    const html = allotmentConfirmationTemplate(fullName, committee, portfolio);
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Your RJMUN Allotment Details',
      html,
    });
    if (error) throw error;
    return data;
  }
}

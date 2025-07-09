import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { registrationConfirmationTemplate } from './templates/registration-confirmation.template';
import { caConfirmationTemplate } from './templates/ca-confirmation.template';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendRegistrationConfirmation(
    to: string,
    regId: string,
    fullName: string,
  ) {
    const html = registrationConfirmationTemplate(fullName, regId);

    const mailOptions = {
      from: `"RJMUN" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'RJMUN Registration Confirmation',
      html,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendCAConfirmationEmail(
    to: string,
    fullName: string,
    institution: string,
  ) {
    const html = caConfirmationTemplate(fullName, institution);

    const mailOptions = {
      from: `"RJMUN" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'RJMUN CA Registration Confirmation',
      html,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

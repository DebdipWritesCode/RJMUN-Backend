import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password
      },
    });
  }

  async sendRegistrationConfirmation(
    to: string,
    regId: string,
    fullName: string,
  ) {
    const mailOptions = {
      from: `"RJMUN" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'RJMUN Registration Confirmation',
      text: `Dear ${fullName},\n\nThank you for registering for RJMUN. Your registration ID is ${regId}.\n\nBest regards,\nRJMUN Team`,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendCAConfirmationEmail(
    to: string,
    fullName: string,
    institution: string,
  ) {
    const mailOptions = {
      from: `"RJMUN" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'RJMUN CA Registration Confirmation',
      text: `Dear ${fullName},\n\nThank you for registering as a Campus Ambassador for RJMUN from ${institution}. We appreciate your interest and will contact you shortly with further details.\n\nBest regards,\nRJMUN Team`,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

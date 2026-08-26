import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { EmailService } from './email.service';

const resendSend = jest.fn();
const smtpSendMail = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: resendSend },
  })),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: smtpSendMail })),
}));

describe('EmailService', () => {
  const originalEnv = process.env;
  const createTransport = jest.mocked(nodemailer.createTransport);
  let loggerWarn: jest.SpiedFunction<Logger['warn']>;
  let loggerError: jest.SpiedFunction<Logger['error']>;

  beforeEach(() => {
    jest.clearAllMocks();
    loggerWarn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'resend-test-key',
      RESEND_FROM_EMAIL: 'RJMUN 3.0 <noreply@example.com>',
      GMAIL_SMTP_USER: 'fallback@gmail.com',
      GMAIL_SMTP_APP_PASSWORD: 'gmail-app-password',
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses Resend as the primary provider', async () => {
    resendSend.mockResolvedValue({ data: { id: 'resend-id' }, error: null });

    const result = await new EmailService().sendRegistrationConfirmation(
      'delegate@example.com',
      'RJMUN-001',
      'Test Delegate',
      1000,
    );

    expect(result).toEqual({ provider: 'resend', id: 'resend-id' });
    expect(resendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'RJMUN 3.0 <noreply@example.com>',
        to: 'delegate@example.com',
        subject: 'RJMUN Registration Confirmation',
      }),
    );
    expect(smtpSendMail).not.toHaveBeenCalled();
  });

  it('falls back to Gmail SMTP when Resend returns an error', async () => {
    resendSend.mockResolvedValue({
      data: null,
      error: { message: 'Monthly sending limit reached' },
    });
    smtpSendMail.mockResolvedValue({ messageId: 'gmail-id' });

    const result = await new EmailService().sendRegistrationConfirmation(
      'delegate@example.com',
      'RJMUN-002',
      'Fallback Delegate',
      1000,
    );

    expect(result).toEqual({ provider: 'gmail' });
    expect(smtpSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'RJMUN 3.0 <fallback@gmail.com>',
        to: 'delegate@example.com',
        subject: 'RJMUN Registration Confirmation',
      }),
    );
    expect(loggerWarn).toHaveBeenCalledWith(
      'Resend delivery failed; attempting Gmail SMTP fallback.',
    );
  });

  it('falls back to Gmail SMTP when Resend throws', async () => {
    resendSend.mockRejectedValue(new Error('Resend unavailable'));
    smtpSendMail.mockResolvedValue({ messageId: 'gmail-id' });

    await expect(
      new EmailService().sendCAConfirmationEmail(
        'ca@example.com',
        'Test CA',
        'Test Institution',
      ),
    ).resolves.toEqual({ provider: 'gmail' });
  });

  it('uses Gmail directly when Resend is not configured', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    smtpSendMail.mockResolvedValue({ messageId: 'gmail-only-id' });

    await new EmailService().sendAllotmentEmail(
      'delegate@example.com',
      'Test Delegate',
      'UNSC',
      'India',
    );

    expect(Resend).not.toHaveBeenCalled();
    expect(smtpSendMail).toHaveBeenCalledTimes(1);
  });

  it('keeps working with Resend when Gmail is not configured', async () => {
    delete process.env.GMAIL_SMTP_USER;
    delete process.env.GMAIL_SMTP_APP_PASSWORD;
    resendSend.mockResolvedValue({ data: { id: 'resend-id' }, error: null });

    await new EmailService().sendDayRegistrationConfirmation(
      'delegate@example.com',
      'FEST-001',
      'Test Delegate',
      'Day 1',
    );

    expect(createTransport).not.toHaveBeenCalled();
    expect(resendSend).toHaveBeenCalledTimes(1);
  });

  it('does not reject a completed registration when email delivery fails', async () => {
    delete process.env.GMAIL_SMTP_USER;
    delete process.env.GMAIL_SMTP_APP_PASSWORD;
    resendSend.mockResolvedValue({
      data: null,
      error: { message: 'Monthly sending limit reached' },
    });

    await expect(
      new EmailService().trySendRegistrationConfirmation(
        'delegate@example.com',
        'RJMUN-003',
        'Saved Delegate',
        1200,
      ),
    ).resolves.toBe(false);

    expect(loggerError).toHaveBeenCalledWith(
      'Registration confirmation email could not be delivered.',
      expect.any(String),
    );
  });

  it('rejects startup when neither provider is configured', () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    delete process.env.GMAIL_SMTP_USER;
    delete process.env.GMAIL_SMTP_APP_PASSWORD;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;

    expect(() => new EmailService()).toThrow(
      'Email delivery is not configured',
    );
  });
});

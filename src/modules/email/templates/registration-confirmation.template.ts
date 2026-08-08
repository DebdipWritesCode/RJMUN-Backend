export const registrationConfirmationTemplate = (
  fullName: string,
  regId: string,
  registrationAmount: number,
) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #333;
        padding: 20px;
        margin: 0;
      }
      .container {
        background-color: #ffffff;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        max-width: 600px;
        margin: 0 auto;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 3px solid #667eea;
        padding-bottom: 20px;
      }
      .header h1 {
        color: #667eea;
        margin: 0;
        font-size: 28px;
      }
      .header p {
        color: #999;
        margin: 5px 0 0 0;
        font-size: 14px;
      }
      .section {
        margin: 25px 0;
      }
      .section-title {
        color: #667eea;
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .info-block {
        background-color: #f8f9ff;
        padding: 15px;
        border-left: 4px solid #667eea;
        margin-bottom: 12px;
        border-radius: 4px;
      }
      .info-label {
        color: #999;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 5px;
      }
      .info-value {
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }
      .highlight-box {
        background: linear-gradient(135deg, #f8f9ff 0%, #f0f3ff 100%);
        border: 2px solid #667eea;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        text-align: center;
      }
      .highlight-box .label {
        color: #666;
        font-size: 14px;
        margin-bottom: 10px;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e8ebf0;
        color: #999;
        font-size: 13px;
      }
      .steps {
        margin: 15px 0;
      }
      .step-item {
        padding: 10px 0;
        padding-left: 25px;
        border-left: 2px solid #764ba2;
        margin-bottom: 10px;
        color: #555;
        font-size: 14px;
        position: relative;
      }
      .step-item::before {
        content: "✓";
        position: absolute;
        left: -10px;
        color: #764ba2;
        font-weight: bold;
        font-size: 16px;
      }
      ul {
        margin: 10px 0;
        padding-left: 20px;
      }
      ul li {
        margin-bottom: 8px;
        color: #555;
      }
      .registration-summary {
        background-color: #f8f9ff;
        border: 1px solid #e8ebf0;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
      }
      .registration-summary p {
        margin: 8px 0;
        color: #666;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎓 RJMUN Registration</h1>
        <p>Welcome to the most exciting MUN experience!</p>
      </div>

      <p style="font-size: 16px;">Hi ${fullName},</p>
      <p style="font-size: 15px; line-height: 1.6;">Congratulations! Your registration for RJMUN has been successfully confirmed. We're thrilled to have you join us for what promises to be an incredible experience. Below are your registration details.</p>

      <div class="section">
        <div class="section-title">📋 Your Registration Details</div>
        <div class="info-block">
          <div class="info-label">Registration ID</div>
          <div class="info-value" style="font-family: 'Courier New', monospace; letter-spacing: 1px;">${regId}</div>
        </div>
      </div>

      <div class="highlight-box">
        <div class="label">Registration Status</div>
        <div style="font-size: 20px; color: #764ba2; font-weight: bold;">✓ CONFIRMED</div>
        <div class="label" style="margin-top: 10px;">Registration Amount: ₹${registrationAmount}</div>
      </div>

      <div class="section">
        <div class="section-title">✨ What Happens Next?</div>
        <div class="steps">
          <div class="step-item">You'll receive committee allotment through email</div>
          <div class="step-item">Check your verified email for further updates</div>
          <div class="step-item">Join our official Discord/WhatsApp for live updates</div>
          <div class="step-item">Attend our pre-event briefing session</div>
          <div class="step-item">Come prepared and have an amazing RJMUN experience! 🎉</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📌 Important Notes</div>
        <ul style="color: #666;">
          <li><strong>Keep your Registration ID safe</strong> - You'll need it for check-in and all official communications</li>
          <li><strong>Check your email regularly</strong> - We'll send critical updates regarding committee allotment and schedules</li>
          <li><strong>Update your profile</strong> - Ensure your contact information is accurate for future communications</li>
          <li><strong>Prepare your portfolio</strong> - Start researching your assigned committee and country</li>
        </ul>
      </div>

      <div class="section">
        <div class="section-title">❓ Frequently Asked Questions</div>
        <div class="registration-summary">
          <p><strong>Q: When will I get my committee allotment?</strong><br/>
          A: Committee allotments are typically released 5-7 days before the event. You'll receive an email notification.</p>
          
          <p><strong>Q: Can I change my committee preferences?</strong><br/>
          A: Committee changes must be requested within 48 hours of receiving your allotment. Contact the organizing committee.</p>
          
          <p><strong>Q: Do I need to pay again?</strong><br/>
          A: No, your registration amount of ₹${registrationAmount} is a one-time payment.</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📞 Need Help?</div>
        <p style="font-size: 14px; color: #666;">If you have any questions or concerns, feel free to reach out to us:</p>
        <div class="info-block">
          <div style="color: #667eea; font-weight: 600;">📧 rjmun2025@gmail.com</div>
          <div style="color: #999; font-size: 13px; margin-top: 5px;">We typically respond within 24 hours</div>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0; color: #bbb; font-size: 12px;">This is an automated confirmation email. Please do not reply to this email.</p>
        <p style="margin: 15px 0 0 0; font-weight: 500;">We look forward to seeing you at RJMUN! 🎭</p>
        <p style="margin: 10px 0 0 0;">Best regards,<br/><strong>RJMUN Organizing Committee</strong></p>
      </div>
    </div>
  </body>
</html>
`;

export const caConfirmationTemplate = (
  fullName: string,
  institution: string,
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
        content: "→";
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
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🌟 Campus Ambassador</h1>
        <p>Thank you for joining the RJMUN family!</p>
      </div>

      <p style="font-size: 16px;">Hi ${fullName},</p>
      <p style="font-size: 15px; line-height: 1.6;">Thank you for registering as a <strong>Campus Ambassador</strong> for RJMUN from <strong>${institution}</strong>. We're thrilled to have you on board! As a Campus Ambassador, you'll play a crucial role in bringing RJMUN to your campus and helping us reach more students interested in Model UN.</p>

      <div class="section">
        <div class="section-title">📋 Your Information</div>
        <div class="info-block">
          <div class="info-label">Name</div>
          <div class="info-value">${fullName}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Institution</div>
          <div class="info-value">${institution}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Role</div>
          <div class="info-value">Campus Ambassador</div>
        </div>
      </div>

      <div class="highlight-box">
        <div class="label">Status</div>
        <div style="font-size: 20px; color: #764ba2; font-weight: bold;">✓ APPLICATION RECEIVED</div>
        <div class="label" style="margin-top: 10px;">We'll be in touch soon with next steps</div>
      </div>

      <div class="section">
        <div class="section-title">📌 What To Expect</div>
        <div class="steps">
          <div class="step-item">Our team will review your application</div>
          <div class="step-item">You'll receive an email with CA guidelines and benefits</div>
          <div class="step-item">Access to exclusive promotional materials</div>
          <div class="step-item">Regular updates and communication from the RJMUN team</div>
          <div class="step-item">Special recognition during the event!</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">🎯 Your Responsibilities</div>
        <ul style="color: #666;">
          <li>Promote RJMUN across your campus and community</li>
          <li>Help register interested participants</li>
          <li>Share event updates and information</li>
          <li>Coordinate with our core team for any campus-related activities</li>
          <li>Be the face of RJMUN at your institution</li>
        </ul>
      </div>

      <div class="section">
        <div class="section-title">🏆 Campus Ambassador Benefits</div>
        <ul style="color: #666;">
          <li>Certificate of appreciation</li>
          <li>Special recognition at the event</li>
          <li>Access to exclusive CA events</li>
          <li>Networking opportunities with other CAs</li>
          <li>Participation in special sessions at RJMUN</li>
        </ul>
      </div>

      <div class="section">
        <div class="section-title">📞 Need Help?</div>
        <p style="font-size: 14px; color: #666;">If you have any questions about your Campus Ambassador role, feel free to reach out to us:</p>
        <div class="info-block">
          <div style="color: #667eea; font-weight: 600;">📧 rjmun2025@gmail.com</div>
          <div style="color: #999; font-size: 13px; margin-top: 5px;">We typically respond within 24 hours</div>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0; color: #bbb; font-size: 12px;">This is an automated confirmation email. Please do not reply to this email.</p>
        <p style="margin: 15px 0 0 0; font-weight: 500;">We can't wait to work with you! 🚀</p>
        <p style="margin: 10px 0 0 0;">Best regards,<br/><strong>RJMUN Organizing Committee</strong></p>
      </div>
    </div>
  </body>
</html>
`;

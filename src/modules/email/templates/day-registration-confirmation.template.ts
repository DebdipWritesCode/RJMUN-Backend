export const dayRegistrationConfirmationTemplate = (
  firstName: string,
  regId: string,
  selectedDaysSummary: string,
  daysWithActivities?: Array<{
    dayName: string;
    dayDate: string;
    activities: string[];
  }>,
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
      .day-card {
        background-color: #f8f9ff;
        border: 2px solid #e8ebf0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        transition: all 0.3s ease;
      }
      .day-card:hover {
        border-color: #667eea;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
      }
      .day-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .day-name {
        font-weight: bold;
        color: #333;
        font-size: 16px;
      }
      .day-date {
        color: #667eea;
        font-size: 14px;
        font-weight: 500;
      }
      .activities-list {
        margin-top: 10px;
      }
      .activity-item {
        padding: 8px 0;
        padding-left: 16px;
        border-left: 2px solid #764ba2;
        margin-bottom: 8px;
        color: #555;
        font-size: 14px;
        position: relative;
      }
      .activity-item::before {
        content: "✓";
        position: absolute;
        left: -10px;
        color: #764ba2;
        font-weight: bold;
      }
      .no-activities {
        color: #999;
        font-size: 14px;
        font-style: italic;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e8ebf0;
        color: #999;
        font-size: 13px;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 6px;
        margin-top: 20px;
        font-weight: bold;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎭 DESTINIQUE</h1>
        <p>Thank you for registering! We're excited to have you</p>
      </div>

      <p style="font-size: 16px;">Hi ${firstName},</p>
      <p style="font-size: 15px; line-height: 1.6;">Thank you for registering for our fest days. We're thrilled to have you join us! Below is your registration confirmation with details about the days and activities you've selected.</p>

      <div class="section">
        <div class="section-title">📋 Registration Details</div>
        <div class="info-block">
          <div class="info-label">Registration ID</div>
          <div class="info-value" style="font-family: 'Courier New', monospace; letter-spacing: 1px;">${regId}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📅 Days & Activities</div>
        ${
          daysWithActivities && daysWithActivities.length > 0
            ? daysWithActivities
                .map(
                  (item) => `
          <div class="day-card">
            <div class="day-header">
              <span class="day-name">${item.dayName}</span>
              <span class="day-date">${item.dayDate}</span>
            </div>
            <div class="activities-list">
              ${
                item.activities.length > 0
                  ? item.activities.map((activity) => `<div class="activity-item">${activity}</div>`).join('')
                  : '<div class="no-activities">No activities selected for this day</div>'
              }
            </div>
          </div>
          `,
                )
                .join('')
            : `<div class="info-block">
                 <p style="margin: 0; color: #555;">${selectedDaysSummary}</p>
               </div>`
        }
      </div>

      <div class="section">
        <div class="section-title">✨ What's Next?</div>
        <p style="color: #666; font-size: 14px; line-height: 1.8;">
          • You're all set for the fest days!<br/>
          • Keep this registration ID safe for check-in<br/>
          • Watch out for more updates from our team<br/>
          • Have a wonderful experience! 🎉
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0; color: #bbb;">If you have any questions, feel free to reach out to us at rjmun2025@gmail.com</p>
        <p style="margin: 10px 0 0 0;">Best regards,<br/>RJMUN Team</p>
      </div>
    </div>
  </body>
</html>
`;

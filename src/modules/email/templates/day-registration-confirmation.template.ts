export const dayRegistrationConfirmationTemplate = (
  firstName: string,
  regId: string,
  selectedDaysSummary: string,
) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f9f9f9;
        color: #333;
        padding: 20px;
      }
      .container {
        background-color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      h2 {
        color: #004aad;
      }
      p {
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Fest Day Registration Confirmation</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for registering for our fest days. We're excited to have you!</p>
      <p><strong>Your Registration ID:</strong> ${regId}</p>
      <p><strong>Registered days:</strong> ${selectedDaysSummary}</p>
      <p>If you have any questions, feel free to reach out to us.</p>
      <p>Best regards,<br/>RJMUN Team</p>
    </div>
  </body>
</html>
`;

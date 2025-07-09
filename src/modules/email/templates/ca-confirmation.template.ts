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
      <h2>Hi ${fullName}!</h2>
      <p>Thank you for registering as a <strong>Campus Ambassador</strong> for RJMUN from <strong>${institution}</strong>.</p>
      <p>We appreciate your interest and will contact you shortly with further details.</p>
      <p>Stay tuned!</p>
      <p>Best regards,<br/>RJMUN Team</p>
    </div>
  </body>
</html>
`;

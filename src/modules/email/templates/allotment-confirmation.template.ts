export const allotmentConfirmationTemplate = (
  fullName: string,
  committee: string,
  portfolio: string,
) => `
  <div style="font-family: sans-serif; padding: 20px;">
    <h2>Hello ${fullName},</h2>
    <p>We're excited to inform you that you've been allotted a committee and portfolio for RJMUN.</p>
    <p><strong>Committee:</strong> ${committee}</p>
    <p><strong>Portfolio:</strong> ${portfolio}</p>
    <p>We're looking forward to seeing you at the event. Further details will be shared soon.</p>
    <p>Best,<br/>The RJMUN Team</p>
  </div>
`;

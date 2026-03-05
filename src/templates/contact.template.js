export const getContactNotificationTemplate = (
  name,
  email,
  subject,
  message,
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Inquiry - Optivo Solutions</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
      margin: 0;
      padding: 20px;
      line-height: 1.7;
      color: #2c3e50;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .detail-row {
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #636e72;
      font-size: 14px;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .value {
      font-size: 16px;
      color: #2d3436;
    }
    .message-box {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-top: 10px;
      border-left: 4px solid #6c5ce7;
    }
    .footer {
      background-color: #f1f2f6;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #636e72;
    }
    a {
      color: #6c5ce7;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>New Contact Inquiry</h1>
    </div>
    
    <div class="content">
      <div class="detail-row">
        <div class="label">From</div>
        <div class="value"><strong>${name}</strong></div>
      </div>
      
      <div class="detail-row">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${email}">${email}</a></div>
      </div>
      
      <div class="detail-row">
        <div class="label">Subject</div>
        <div class="value">${subject || "No Subject"}</div>
      </div>
      
      <div class="detail-row">
        <div class="label">Message</div>
        <div class="value message-box">
          ${message ? message.replace(/\n/g, "<br>") : "No message content"}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>This email was sent from the Optivo Solutions contact form.</p>
      <p>&copy; ${new Date().getFullYear()} Optivo Solutions</p>
    </div>
  </div>
</body>
</html>
  `;
};

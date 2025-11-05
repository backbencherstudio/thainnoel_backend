export const sendConsultationToUser = (
  firstName,
  lastName,
  company,
  email,
  service,
  datetime
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation Confirmation - Optivo Solutions</title>
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
      background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      color: #ffffff;
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 8s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .header h1 {
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .header .tagline {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
      font-weight: 300;
      letter-spacing: 0.3px;
    }
    .content {
      padding: 50px 40px;
      background-color: #ffffff;
    }
    .greeting {
      font-size: 20px;
      color: #2c3e50;
      margin-bottom: 24px;
      font-weight: 500;
    }
    .intro-text {
      font-size: 16px;
      color: #546e7a;
      margin-bottom: 35px;
      line-height: 1.8;
    }
    .details-container {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      padding: 35px;
      margin: 35px 0;
      border: 1px solid #e1e8ed;
    }
    .details-title {
      font-size: 18px;
      font-weight: 600;
      color: #4a90e2;
      margin-bottom: 25px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .detail-row {
      display: flex;
      padding: 16px 0;
      border-bottom: 1px solid #e1e8ed;
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #34495e;
      min-width: 140px;
      font-size: 15px;
    }
    .detail-value {
      color: #546e7a;
      font-size: 15px;
      flex: 1;
    }
    .service-badge {
      display: inline-block;
      background: linear-gradient(135deg, #6cbbd8 0%, #5aa8c4 100%);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      margin-top: 4px;
    }
    .mission-section {
      background: linear-gradient(135deg, #e8f4f8 0%, #d4e9f2 100%);
      padding: 30px;
      border-radius: 12px;
      margin: 35px 0;
      border-left: 4px solid #4a90e2;
    }
    .mission-section p {
      font-size: 15px;
      color: #546e7a;
      line-height: 1.8;
      margin: 0;
      font-style: italic;
    }
    .footer {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: #ecf0f1;
      padding: 45px 40px;
      text-align: center;
    }
    .footer-brand {
      margin-bottom: 25px;
    }
    .footer-brand strong {
      font-size: 20px;
      color: #ffffff;
      display: block;
      margin-bottom: 8px;
    }
    .footer-brand .mission {
      font-size: 14px;
      color: #bdc3c7;
      line-height: 1.6;
    }
    .footer-contact {
      margin: 30px 0;
      padding: 25px 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .footer-contact-item {
      margin: 12px 0;
      font-size: 14px;
      color: #ecf0f1;
      line-height: 1.8;
    }
    .footer-contact-item a {
      color: #6cbbd8;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .footer-contact-item a:hover {
      color: #4a90e2;
    }
    .copyright {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid rgba(255,255,255,0.1);
      color: #95a5a6;
      font-size: 12px;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      .email-wrapper {
        border-radius: 12px;
      }
      .header {
        padding: 40px 25px;
      }
      .header h1 {
        font-size: 26px;
      }
      .content {
        padding: 35px 25px;
      }
      .details-container {
        padding: 25px 20px;
      }
      .detail-row {
        flex-direction: column;
        gap: 6px;
      }
      .detail-label {
        min-width: auto;
      }
      .footer {
        padding: 35px 25px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="header-content">
        <h1>Consultation Confirmed</h1>
        <p class="tagline">Optimize Your Business Operations & Growth</p>
      </div>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${firstName},</div>
      
      <div class="intro-text">
        Thank you for choosing <strong>Optivo Solutions</strong>. We're delighted that you've taken the first step toward transforming your business operations. Your consultation has been successfully scheduled, and we're excited to learn about your unique challenges and opportunities.
      </div>
      
      <div class="details-container">
        <div class="details-title">
          <span>Consultation Details</span>
        </div>
        <div class="detail-row">
          <div class="detail-label">Name</div>
          <div class="detail-value">${firstName} ${lastName}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Company</div>
          <div class="detail-value">${company}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Email</div>
          <div class="detail-value">${email}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Service Interest</div>
          <div class="detail-value">
            <span class="service-badge">${service}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Scheduled Time</div>
          <div class="detail-value"><strong>${datetime}</strong></div>
        </div>
      </div>
      
      <div class="mission-section">
        <p>"We help companies streamline processes, implement automation, and scale efficiently. From startups to enterprise, we deliver results that drive growth."</p>
      </div>
      
      <div class="intro-text">
        Our mission is to empower business leaders like you with the systems, tools, and support needed to scale sustainably. During our consultation, we'll explore how we can help optimize your operations and eliminate the chaos that comes with rapid growth.
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-brand">
        <strong>Optivo Solutions</strong>
        <div class="mission">Empowering business leaders with systems, tools, and support to scale sustainably</div>
      </div>
      
      <div class="footer-contact">
        <div class="footer-contact-item">📧 <a href="mailto:info@optivo.solutions">info@optivo.solutions</a></div>
        <div class="footer-contact-item">📞 <a href="tel:+855558886666">+85 555 8888 6666</a></div>
        <div class="footer-contact-item">📍 4517 Washington Ave. Manchester, Kentucky 39495</div>
      </div>
      
      <div class="copyright">
        © 2025 Optivo Solutions. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const sendConsultationToAdmin = (
  firstName,
  lastName,
  company,
  email,
  service,
  datetime,
  message = ""
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Consultation Booking - Optivo Solutions</title>
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
      background: linear-gradient(135deg, #52c5a5 0%, #3da085 100%);
      color: #ffffff;
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 8s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .header h1 {
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .header .tagline {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
      font-weight: 300;
      letter-spacing: 0.3px;
    }
    .content {
      padding: 50px 40px;
      background-color: #ffffff;
    }
    .notification-box {
      background: linear-gradient(135deg, #fff9e6 0%, #fff4d6 100%);
      border-left: 4px solid #52c5a5;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .notification-box p {
      margin: 0;
      font-size: 15px;
      color: #5d4e37;
      line-height: 1.8;
    }
    .notification-box strong {
      color: #3da085;
      font-size: 16px;
      display: block;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
      margin: 35px 0 20px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid #e1e8ed;
    }
    .details-container {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      padding: 35px;
      margin: 25px 0;
      border: 1px solid #e1e8ed;
    }
    .detail-row {
      display: flex;
      padding: 18px 0;
      border-bottom: 1px solid #e1e8ed;
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #34495e;
      min-width: 150px;
      font-size: 15px;
    }
    .detail-value {
      color: #546e7a;
      font-size: 15px;
      flex: 1;
    }
    .detail-value a {
      color: #4a90e2;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .detail-value a:hover {
      color: #357abd;
      text-decoration: underline;
    }
    .service-badge {
      display: inline-block;
      background: linear-gradient(135deg, #52c5a5 0%, #3da085 100%);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    .message-container {
      background: linear-gradient(135deg, #e8f4f8 0%, #d4e9f2 100%);
      border-left: 4px solid #4a90e2;
      padding: 25px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .message-container h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #4a90e2;
      font-weight: 600;
    }
    .message-container p {
      margin: 0;
      font-size: 15px;
      color: #546e7a;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .quick-actions {
      background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
      padding: 25px;
      border-radius: 12px;
      margin: 30px 0;
      border: 1px solid #cce5ff;
    }
    .quick-actions h4 {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: #4a90e2;
      font-weight: 600;
    }
    .quick-actions p {
      margin: 8px 0;
      font-size: 14px;
      color: #546e7a;
      line-height: 1.8;
    }
    .quick-actions a {
      color: #4a90e2;
      text-decoration: none;
      font-weight: 500;
    }
    .quick-actions a:hover {
      text-decoration: underline;
    }
    .footer {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: #ecf0f1;
      padding: 45px 40px;
      text-align: center;
    }
    .footer-brand {
      margin-bottom: 25px;
    }
    .footer-brand strong {
      font-size: 20px;
      color: #ffffff;
      display: block;
      margin-bottom: 8px;
    }
    .footer-brand .mission {
      font-size: 14px;
      color: #bdc3c7;
      line-height: 1.6;
    }
    .footer-contact {
      margin: 30px 0;
      padding: 25px 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .footer-contact-item {
      margin: 12px 0;
      font-size: 14px;
      color: #ecf0f1;
      line-height: 1.8;
    }
    .footer-contact-item a {
      color: #6cbbd8;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .footer-contact-item a:hover {
      color: #4a90e2;
    }
    .copyright {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid rgba(255,255,255,0.1);
      color: #95a5a6;
      font-size: 12px;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      .email-wrapper {
        border-radius: 12px;
      }
      .header {
        padding: 40px 25px;
      }
      .header h1 {
        font-size: 26px;
      }
      .content {
        padding: 35px 25px;
      }
      .details-container {
        padding: 25px 20px;
      }
      .detail-row {
        flex-direction: column;
        gap: 6px;
      }
      .detail-label {
        min-width: auto;
      }
      .footer {
        padding: 35px 25px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="header-content">
        <h1>New Consultation Request</h1>
        <p class="tagline">Action Required - Optivo Solutions</p>
      </div>
    </div>
    
    <div class="content">
      <div class="notification-box">
        <strong>New consultation booking received</strong>
        <p>A potential client has scheduled a consultation. Please review the details below and prepare accordingly.</p>
      </div>
      
      <div class="section-title">Client Information</div>
      
      <div class="details-container">
        <div class="detail-row">
          <div class="detail-label">Full Name</div>
          <div class="detail-value"><strong>${firstName} ${lastName}</strong></div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Company</div>
          <div class="detail-value">${company}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Email</div>
          <div class="detail-value">
            <a href="mailto:${email}">${email}</a>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Service Interest</div>
          <div class="detail-value">
            <span class="service-badge">${service}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Scheduled Time</div>
          <div class="detail-value"><strong>${datetime}</strong></div>
        </div>
      </div>
      
      ${message ? `
      <div class="section-title">Client Message</div>
      <div class="message-container">
        <h4>Message from Client</h4>
        <p>${message}</p>
      </div>
      ` : ''}
      
      <div class="quick-actions">
        <h4>Quick Actions</h4>
        <p>📧 Reply to client: <a href="mailto:${email}">${email}</a></p>
        <p>📅 Meeting scheduled: <strong>${datetime}</strong></p>
        <p>🎯 Service focus: <strong>${service}</strong></p>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; font-size: 14px; color: #546e7a; line-height: 1.8;">
        <strong style="color: #2c3e50;">Preparation Tips:</strong><br>
        Review the client's company and service interest to prepare relevant case studies and solutions. Consider their specific challenges in operations, automation, or scaling.
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-brand">
        <strong>Optivo Solutions</strong>
        <div class="mission">Optimize Your Business Operations & Growth</div>
      </div>
      
      <div class="footer-contact">
        <div class="footer-contact-item">📧 <a href="mailto:info@optivo.solutions">info@optivo.solutions</a></div>
        <div class="footer-contact-item">📞 <a href="tel:+855558886666">+85 555 8888 6666</a></div>
        <div class="footer-contact-item">📍 4517 Washington Ave. Manchester, Kentucky 39495</div>
      </div>
      
      <div class="copyright">
        © 2025 Optivo Solutions. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// ESM exports above


const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: String(process.env.SMTP_PORT) === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const emailTemplates = {
  approval: (data) => ({
    subject: 'AIAS Membership Approved - Welcome!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Welcome to AIAS An-Najah Chapter!</h2>
        <p>Dear ${data.full_name},</p>
        <p>Congratulations! Your membership application has been <strong>approved</strong>.</p>
        <p>${data.message}</p>
        <p>You can now access all member resources and register for events.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Next Steps:</h3>
          <ul>
            <li>Log in to your account</li>
            <li>Complete your profile</li>
            <li>Browse upcoming events</li>
            <li>Access the resource library</li>
          </ul>
        </div>
        <p>Best regards,<br>AIAS An-Najah Chapter Team</p>
      </div>
    `
  }),
  
  rejection: (data) => ({
    subject: 'AIAS Membership Application Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Membership Application Update</h2>
        <p>Dear ${data.full_name},</p>
        <p>Thank you for your interest in joining AIAS An-Najah Chapter.</p>
        <p>Unfortunately, we cannot approve your membership application at this time.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Reason:</strong> ${data.reason}
        </div>
        <p>If you have any questions, please contact us at admin@aias.najah.edu</p>
        <p>Best regards,<br>AIAS An-Najah Chapter Team</p>
      </div>
    `
  }),

  notification: (data) => ({
    subject: data.subject || 'AIAS Notification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">AIAS An-Najah Chapter</h2>
        <p>Dear ${data.full_name || 'Member'},</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          ${data.message}
        </div>
        <p>Best regards,<br>AIAS An-Najah Chapter Team</p>
      </div>
    `
  })
};

// Email service functions
const emailService = {
  async sendApprovalEmail(email, data) {
    const template = emailTemplates.approval(data);
    
    const mailOptions = {
      from: `"AIAS An-Najah" <${process.env.SMTP_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html
    };

    return await transporter.sendMail(mailOptions);
  },

  async sendRejectionEmail(email, data) {
    const template = emailTemplates.rejection(data);
    
    const mailOptions = {
      from: `"AIAS An-Najah" <${process.env.SMTP_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html
    };

    return await transporter.sendMail(mailOptions);
  },

  async sendNotificationEmail(email, data) {
    const template = emailTemplates.notification(data);
    
    const mailOptions = {
      from: `"AIAS An-Najah" <${process.env.SMTP_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html
    };

    return await transporter.sendMail(mailOptions);
  },

  async sendBulkEmail(emails, data) {
    const promises = emails.map(email => 
      this.sendNotificationEmail(email, data)
    );
    
    return await Promise.allSettled(promises);
  }
};

module.exports = emailService;
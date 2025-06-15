const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    // Autoriser les requêtes cross-origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const { name = '', email, subject, message } = req.body;
  const [firstName = '', lastName = ''] = name.trim().split(' ');

  let to = 'contact@ls2pavocats.fr';
  if (subject === 'Tax Law Enquiry') {
    to = 'tax@ls2pavocats.fr';
  } else if (subject === 'Partnership Request' || subject === 'Press & Media') {
    to = 'partners@ls2pavocats.fr';
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"LS2P Contact Form" <${process.env.MAIL_USER}>`,
      to,
      subject: `${subject}`,
      text: `
        New message from ${firstName} ${lastName}
        Email: ${email}
        Subject: ${subject}

        Message:
        ${message}
      `,
    });

    // ✉️ Confirmation email to sender
    await transporter.sendMail({
      from: `"LS2P Avocats" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Confirmation – We received your message',
      html: `
        <p>Dear ${firstName},</p>
    
        <p>We confirm that your message has been received by <strong>LS2P Avocats</strong>.</p>
    
        <p>
          Your request has been routed to the appropriate team and will be handled with the utmost care.
          We usually respond within <strong>48 hours</strong>, depending on the nature of your inquiry.
        </p>
    
        <hr style="margin: 24px 0;">
    
        <p><strong>Your submitted information:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${firstName} ${lastName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Subject:</strong> ${subject}</li>
          <li><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</li>
        </ul>
    
        <hr style="margin: 24px 0;">
    
        <p style="font-size: 14px; color: #666;">
          In accordance with the General Data Protection Regulation (GDPR), you have the right to access,
          rectify, or delete your personal data at any time by contacting us at
          <a href="mailto:contact@ls2pavocats.fr">contact@ls2pavocats.fr</a>. Your information will be
          used solely to process your inquiry and will not be shared with third parties.
        </p>
    
        <p style="margin-top: 24px;">
          Best regards,<br>
          <strong>LS2P Avocats</strong><br>
          <span style="font-size: 14px; color: #888;">Paris · International Tax & Strategic Advisory</span>
        </p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false });
  }
};


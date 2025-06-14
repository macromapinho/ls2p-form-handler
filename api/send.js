const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Reject anything that isn't POST
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  // Set CORS headers for the actual request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { firstName, lastName, email, subject, message } = req.body;

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
      subject: `[LS2P] ${subject}`,
      text: `
        New message from ${firstName} ${lastName}
        Email: ${email}
        Subject: ${subject}

        Message:
        ${message}
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false });
  }
};

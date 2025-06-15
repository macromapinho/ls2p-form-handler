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
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f9f9f9; padding: 16px;">
          <div style="max-width: 540px; margin: 0 auto; background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 32px; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
            
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">📩 New Contact Form Submission</h2>
            <p style="font-size: 15px; color: #444; margin-bottom: 32px;">A new message has been submitted from the LS2P website:</p>
        
            <div style="font-size: 15px; color: #111;">
              <div style="margin-bottom: 16px;">
                <div style="font-weight: 500; margin-bottom: 4px;">Name:</div>
                <div style="background: #f3f4f6; padding: 10px 14px; border-radius: 8px;">${firstName} ${lastName}</div>
              </div>
            
              <div style="margin-bottom: 16px;">
                <div style="font-weight: 500; margin-bottom: 4px;">Email:</div>
                <div style="background: #f3f4f6; padding: 10px 14px; border-radius: 8px;">
                  <a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">${email}</a>
                </div>
              </div>
            
              <div style="margin-bottom: 16px;">
                <div style="font-weight: 500; margin-bottom: 4px;">Subject:</div>
                <div style="background: #f3f4f6; padding: 10px 14px; border-radius: 8px;">${subject}</div>
              </div>
            
              <div style="margin-bottom: 16px;">
                <div style="font-weight: 500; margin-bottom: 4px;">Message:</div>
                <div style="background: #f3f4f6; padding: 14px; border-radius: 8px; white-space: pre-line;">${message}</div>
              </div>
            </div>
        
            <div style="margin-top: 32px;">
              <div style="font-weight: 500; font-size: 15px; color: #111; margin-bottom: 8px;">Message:</div>
              <div style="background: #f3f4f6; padding: 14px; border-radius: 8px; font-size: 15px; color: #111; white-space: pre-line;">
                ${message}
              </div>
            </div>
        
          </div>
        </div>
      `
    });

    // ✉️ Confirmation email to sender
    await transporter.sendMail({
      from: `"LS2P Avocats" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Confirmation – We received your message',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f9f9f9; padding: 16px;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">📨 Message Received</h2>
            <p style="font-size: 15px; color: #444; margin-bottom: 24px;">
              Dear ${firstName},<br><br>
              Thank you for contacting <strong>LS2P Avocats</strong>. Your message has been successfully received and routed to the appropriate team.
              We typically respond within <strong>48 hours</strong>, depending on the nature of your inquiry.
            </p>
        
            <div style="font-size: 15px; color: #111;">
              <div style="margin-bottom: 16px;">
                <div style="font-weight: 500; margin-bottom: 4px;">Name:</div>
                <div style="background: #f3f4f6; padding: 10px 14px; border-radius: 8px;">${firstName} ${lastName}</div>
              </div>
            
              <div style="margin-bottom: 16px;">
                <div style="font-weight: 500; margin-bottom: 4px;">Email:</div>
                <div style="background: #f3f4f6; padding: 10px 14px; border-radius: 8px;">
                  <a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">${email}</a>
                </div>
              </div>
            
              <div style="margin-bottom: 16px;">
                <div style="font-weight: 500; margin-bottom: 4px;">Subject:</div>
                <div style="background: #f3f4f6; padding: 10px 14px; border-radius: 8px;">${subject}</div>
              </div>
            
              <div style="margin-bottom: 16px;">
                <div style="font-weight: 500; margin-bottom: 4px;">Message:</div>
                <div style="background: #f3f4f6; padding: 14px; border-radius: 8px; white-space: pre-line;">${message}</div>
              </div>
            </div>
        
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              In accordance with the General Data Protection Regulation (GDPR), you may access, rectify, or delete your personal data at any time by emailing us at 
              <a href="mailto:contact@ls2pavocats.fr" style="color: #0066cc; text-decoration: none;">contact@ls2pavocats.fr</a>.
              Your information will be used solely for the purpose of responding to your inquiry and will never be shared with third parties.
            </p>
        
            <p style="margin-top: 32px; font-size: 14px; color: #111;">
              <strong>LS2P Avocats</strong><br>
              <span>Paris · International Tax & Strategic Advisory</span>
            </p>

          </div>
        </div>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false });
  }
};


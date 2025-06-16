const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    if (req.body && typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (err) {
        console.error('❌ Failed to parse JSON body:', err);
        return res.status(400).json({ success: false, error: 'Invalid JSON' });
      }
    }

    console.log('📨 Incoming body:', req.body);
  
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

  console.log('BODY:', req.body);
  const { name = '', email, subject, message, lang = 'en' } = req.body;
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

  // Email content based on language
  const emailContent = {
    en: {
      notification: {
        from: `"LS2P Contact Form" <${process.env.MAIL_USER}>`,
        subject: subject,
        title: '📩 New Contact Form Submission',
        intro: 'A new message has been submitted from the LS2P website:',
        nameLabel: 'Name:',
        emailLabel: 'Email:',
        subjectLabel: 'Subject:',
        messageLabel: 'Message:'
      },
      confirmation: {
        from: `"LS2P Avocats" <${process.env.MAIL_USER}>`,
        subject: 'Confirmation – We received your message',
        title: '📨 Message Received',
        intro: `Dear ${firstName},<br><br>
          Thank you for contacting <strong>LS2P Avocats</strong>. Your message has been successfully received and routed to the appropriate team.
          We typically respond within <strong>48 hours</strong>, depending on the nature of your inquiry.`,
        nameLabel: 'Name:',
        emailLabel: 'Email:',
        subjectLabel: 'Subject:',
        messageLabel: 'Message:',
        gdprText: `In accordance with the General Data Protection Regulation (GDPR), you may access, rectify, or delete your personal data at any time by emailing us at 
          <a href="mailto:contact@ls2pavocats.fr" style="color: #0066cc; text-decoration: none;">contact@ls2pavocats.fr</a>.
          Your information will be used solely for the purpose of responding to your inquiry and will never be shared with third parties.`,
        footer: `<strong>LS2P Avocats</strong><br>
          <span>Paris · International Tax & Strategic Advisory</span>`
      }
    },
    fr: {
      notification: {
        from: `"Formulaire LS2P" <${process.env.MAIL_USER}>`,
        subject: subject,
        title: '📩 Nouvelle soumission de formulaire',
        intro: 'Un message a été envoyé depuis le site LS2P :',
        nameLabel: 'Nom :',
        emailLabel: 'Email :',
        subjectLabel: 'Sujet :',
        messageLabel: 'Message :'
      },
      confirmation: {
        from: `"LS2P Avocats" <${process.env.MAIL_USER}>`,
        subject: 'Confirmation – Nous avons bien reçu votre message',
        title: '📨 Votre message a bien été reçu',
        intro: `Bonjour ${firstName},<br><br>
          Merci d'avoir contacté <strong>LS2P Avocats</strong>. Votre message a été transmis à l'équipe concernée et fera l'objet d'un traitement attentif.
          Vous recevrez une réponse dans un délai moyen de <strong>48 heures</strong>.`,
        nameLabel: 'Nom :',
        emailLabel: 'Email :',
        subjectLabel: 'Sujet :',
        messageLabel: 'Message :',
        gdprText: `Conformément au Règlement général sur la protection des données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. 
          Vous pouvez exercer ces droits en nous écrivant à 
          <a href="mailto:contact@ls2pavocats.fr" style="color: #0066cc; text-decoration: none;">contact@ls2pavocats.fr</a>.
          Vos informations ne seront utilisées que pour répondre à votre demande et ne seront jamais transmises à des tiers.`,
        footer: `<strong>LS2P Avocats</strong><br>
          <span>Paris · Fiscalité internationale & stratégie juridique</span>`
      }
    }
  };

  // Select language content
  const content = lang === 'fr' ? emailContent.fr : emailContent.en;

  try {
    // Send notification email to LS2P
    await transporter.sendMail({
      from: content.notification.from,
      to,
      subject: content.notification.subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f9f9f9; padding: 16px;">
          <div style="max-width: 540px; margin: 0 auto; background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 32px; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
            
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">${content.notification.title}</h2>
            <p style="font-size: 15px; color: #444; margin-bottom: 32px;">${content.notification.intro}</p>
        
            <div style="font-size: 15px; color: #111;">
              <div style="margin-bottom: 16px;"><strong>${content.notification.nameLabel}</strong><br>${firstName} ${lastName}</div>
              <div style="margin-bottom: 16px;"><strong>${content.notification.emailLabel}</strong><br><a href="mailto:${email}" style="color: #0066cc;">${email}</a></div>
              <div style="margin-bottom: 16px;"><strong>${content.notification.subjectLabel}</strong><br>${subject}</div>
              <div style="margin-bottom: 16px;"><strong>${content.notification.messageLabel}</strong><br><div style="background: #f3f4f6; padding: 14px; border-radius: 8px; white-space: pre-line;">${message}</div></div>
            </div>
        
          </div>
        </div>
      `
    });

    // Send confirmation email to the user
    await transporter.sendMail({
      from: content.confirmation.from,
      to: email,
      subject: content.confirmation.subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f9f9f9; padding: 16px;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">${content.confirmation.title}</h2>
            <p style="font-size: 15px; color: #444; margin-bottom: 24px;">
              ${content.confirmation.intro}
            </p>
        
            <div style="font-size: 15px; color: #111;">
              <div style="margin-bottom: 16px;"><strong>${content.confirmation.nameLabel}</strong><br>${firstName} ${lastName}</div>
              <div style="margin-bottom: 16px;"><strong>${content.confirmation.emailLabel}</strong><br><a href="mailto:${email}" style="color: #0066cc;">${email}</a></div>
              <div style="margin-bottom: 16px;"><strong>${content.confirmation.subjectLabel}</strong><br>${subject}</div>
              <div style="margin-bottom: 16px;"><strong>${content.confirmation.messageLabel}</strong><br><div style="background: #f3f4f6; padding: 14px; border-radius: 8px; white-space: pre-line;">${message}</div></div>
            </div>
        
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              ${content.confirmation.gdprText}
            </p>
        
            <p style="margin-top: 32px; font-size: 14px; color: #111;">
              ${content.confirmation.footer}
            </p>

          </div>
        </div>
      `
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error sending email:', error.message, error);
    res.status(500).json({ success: false });
  }
};

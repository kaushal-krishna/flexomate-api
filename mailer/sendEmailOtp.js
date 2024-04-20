const nodemailer = require("nodemailer");
// import email and password from .env
require("dotenv").config();
const { SMTP_HOST, SMTP_EMAIL, SMTP_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

/** send mail from real gmail account */
const sendEmailOtp = (req, res) => {

  const { userEmail } = req.body;

  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Mailgen",
      link: 'https://mailgen.js/'
    }
  })

  let mailResponse = {
    body: {
      name: "Flexiyo",
        intro: 'Your Verification OTP for Flexiyo have been arrived!',
        action: {
            instructions: 'Welcome to Flexiyo! We\'re very excited to have you with us.',
            button: {
                color: '#22BC66', // Optional action button color
                text: '648423',
            }
        },
      outro: "Need help or have queries, Please reach out to our contact form",
      link: "https://flexomate.web.app/account/help"
    }
  }

  let mailBody = MailGenerator.generate(mailResponse)

  let mailMessage = {
    from: SMTP_EMAIL,
    to: userEmail,
    subject: "Place Order",
    html: mailBody
  }

  transporter.sendMail(mailMessage).then(() => {
    return res.status(201).json({
      msg: "We have sent you an Email OTP, Please verify your account to continue."
    })
  }).catch(error => {
    return res.status(500).json({ error })
  });
}


module.exports = {
  sendEmailOtp
}
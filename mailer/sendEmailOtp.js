/* mailer/sendEmailOtp.js */

const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const dotenv = require("dotenv");
dotenv.config();

const { SMTP_HOST, SMTP_EMAIL, SMTP_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

/** Send Email OTP to user's Email */
const sendEmailOtp = (req, res) => {
  try {
    const { userEmail } = req.body;

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Flexiyo",
        link: "https://flexomate.web.app",
        logo: "https://res.cloudinary.com/dihwtwmhy/image/upload/v1713613926/flexiyo/flexiyo_landscape.png",
        logoHeight: "60px",
      },
    });

    let mailBody = {
      body: {
        greeting: "Dear",
        name: "Kaushal",
        intro: "Welcome to Flexiyo! We're very excited to have you with us.",
        action: {
          instructions: "Your OTP for Flexiyo account verification is:",
          button: {
            color: "#000B13",
            text: "648423",
          },
        },
        outro:
          "Thanks for signing up. If you have any questions, don't hesitate to reach out to us.",
      },
    };

    let mailTemplate = MailGenerator.generate(mailBody);

    let mailMessage = {
      from: SMTP_EMAIL,
      to: userEmail,
      subject: "Flexiyo On Boarding OTP",
      html: mailTemplate,
    };

    transporter.sendMail(mailMessage, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send OTP email" });
      } else {
        return res.status(201).json({
          msg: "We have sent you an Email OTP, Please verify your account to continue.",
        });
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send OTP email" });
  }
};

module.exports = {
  sendEmailOtp,
};

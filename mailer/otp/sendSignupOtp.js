const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const dotenv = require("dotenv");
dotenv.config();
const mongoURI = process.env.MONGODB_URI;

/** Email SMTP Configuration */
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

// Function to generate OTP
function generateOTP() {
  let digits =
    "0123456789";
  let OTP = "";
  let length = digits.length;
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * length)];
  }
  return OTP;
}

/** Send Email OTP to user's Email */
const sendSignupEmailOtp = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const generatedEmailOtp = generateOTP();

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
        name: userEmail.split('@')[0],
        intro: "Welcome to Flexiyo! We're very excited to have you with us.",
        action: {
          instructions: "Your OTP for Flexiyo account verification is:",
          button: {
            color: "#000B13",
            text: generatedEmailOtp,
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

    transporter.sendMail(mailMessage, async (error) => {
      if (error) {
        console.error("Error sending email OTP:", error);
        return res.status(200).json({ msg: "Failed to send Email OTP", type: "error"});
      } else {
        const client = new MongoClient(mongoURI);
        await client.connect();
        const verificationOtpsDb = client.db("verification_otps");
        const existingUser = await verificationOtpsDb
          .collection("Otps_Email")
          .findOne({ email: userEmail });

        if (existingUser) {
          if (existingUser.otp.length === 2) {
            existingUser.otp.shift();
          }
          existingUser.otp.push(generatedEmailOtp);

          await verificationOtpsDb
            .collection("Otps_Email")
            .updateOne(
              { email: userEmail },
              { $set: { otp: existingUser.otp } },
            );
        } else {
          await verificationOtpsDb.collection("Otps_Email").insertOne({
            email: userEmail,
            otp: [generatedEmailOtp],
          });
        }

        return res.status(200).json({
          msg: `OTP sent to ${userEmail} successfully. Please check your email.`,
          type: "success"
        });
      }
    })
  } catch (error) {
    console.error("Error sending email OTP:", error);
    return res.status(500).json({ error: "Failed to send OTP email" });
  }
};

module.exports = {
  sendSignupEmailOtp,
};
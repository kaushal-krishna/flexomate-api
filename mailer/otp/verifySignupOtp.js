const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const mongoURI = process.env.MONGODB_URI;

/** Send Email OTP to user's Email */
const verifySignupEmailOtp = async (req, res) => {
  try {
    const { userEmail, userOtp } = req.body;
    const client = new MongoClient(mongoURI);
    await client.connect();
    const verificationOtpsDb = client.db("verification_otps");
    const existingUser = await verificationOtpsDb
      .collection("Otps_Email")
      .findOne({ email: userEmail });

    if (existingUser.otp.includes(userOtp)) {
      return res.status(200).json({
        msg: "Your account has been verified successfully.",
        type: "success"
      });
    } else {
      return res.status(200).json({ msg: "Invalid OTP. Please try again.", "type": "error" });
    }
  } catch (error) {
    console.error("Error verifying email OTP:", error);
    return res.status(500).json({ error: "Failed to verify Email OTP" });
  }
};

module.exports = {
  verifySignupEmailOtp,
};

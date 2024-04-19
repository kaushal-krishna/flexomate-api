import nodemailer from "nodemailer";
// import email and password from .env
require("dotenv").config();
const { EMAIL, PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

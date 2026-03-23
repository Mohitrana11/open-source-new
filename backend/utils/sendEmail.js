import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

const sendEmail = async ({ email, emailType, userId }) => {
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiry = Date.now() + 60 * 60 * 1000;

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          verifyToken: hashedToken,
          verifyTokenExpiry: expiry,
        },
      });
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          forgotPasswordToken: hashedToken,
          forgotPasswordTokenExpiry: expiry,
        },
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const domain = process.env.DOMAIN || "http://localhost:5000";
    const path = emailType === "VERIFY" ? "/verifyemail" : "/reset-password";
    const link = `${domain}${path}?token=${token}`;
    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: email,
      subject:
        emailType === "VERIFY" ? "Verify your Email" : "Reset your Password",
      text: `Click the link to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}: ${link}`,
      html: `
        <h3>${emailType === "VERIFY" ? "Email Verification" : "Password Reset"}</h3>
        <p>Click the button below to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}.</p>
        <a href="${link}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        ">
          ${emailType === "VERIFY" ? "Verify Email" : "Reset Password"}
        </a>
        <p>This link will expire in <strong>1 hour</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
  } catch (err) {
    throw new ErrorHandler(err.message || "Failed to send email", 500);
  }
};

export default sendEmail;

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmailOTP = async (email: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "GameHub-X Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #050505; color: #fff; text-align: center; border-radius: 10px;">
          <h2 style="color: #22c55e;">GameHub-X Authorization</h2>
          <p style="color: #ccc;">Your one-time password (OTP) to login is:</p>
          <h1 style="letter-spacing: 5px; color: #fff; background: #22c55e; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h1>
          <p style="color: #ccc; font-size: 12px;">This code will expire in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Could not send OTP email");
  }
};
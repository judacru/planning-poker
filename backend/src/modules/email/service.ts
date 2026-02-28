import nodemailer from "nodemailer";
import { EmailOptions } from "./dto.js";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Verify connection (optional, for debugging)
      // await this.transporter.verify();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      console.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    nickname: string,
    verificationToken: string
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const { getVerificationEmailTemplate } = await import("./templates.js");
    const html = getVerificationEmailTemplate(nickname, verificationUrl);

    await this.sendEmail({
      to: email,
      subject: "Verify Your Email - Planning Poker",
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    nickname: string,
    resetToken: string
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const { getPasswordResetEmailTemplate } = await import("./templates.js");
    const html = getPasswordResetEmailTemplate(nickname, resetUrl);

    await this.sendEmail({
      to: email,
      subject: "Password Reset - Planning Poker",
      html,
    });
  }
}

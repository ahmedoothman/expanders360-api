import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('EMAIL_USER') as string,
      to: email,
      subject: 'Password Reset OTP - Expanders360',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP is valid for 15 minutes only</li>
            <li>Do not share this OTP with anyone</li>
            <li>If you did not request this password reset, please ignore this email</li>
          </ul>
          
          <p>Best regards,<br>Expanders360 Team</p>
          
          <hr style="margin-top: 30px;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(email: string, companyName: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('EMAIL_USER') as string,
      to: email,
      subject: 'Welcome to Expanders360!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Welcome to Expanders360!</h2>
          <p>Hello ${companyName},</p>
          <p>Thank you for registering with Expanders360. Your account has been successfully created.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Create and manage projects</li>
            <li>Find and connect with vendors</li>
            <li>Track project progress and analytics</li>
          </ul>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>Expanders360 Team</p>
          
          <hr style="margin-top: 30px;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }

  async sendRegistrationOtpEmail(
    email: string,
    otp: string,
    companyName: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get('EMAIL_USER') as string,
      to: email,
      subject: 'Email Verification - Expanders360',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Welcome to Expanders360!</h2>
          <p>Hello ${companyName},</p>
          <p>Thank you for registering with Expanders360. To complete your registration and verify your email address, please use the following One-Time Password (OTP):</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #28a745; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP is valid for 15 minutes only</li>
            <li>Do not share this OTP with anyone</li>
            <li>Your account will remain inactive until email verification is complete</li>
          </ul>
          
          <p>Once verified, you'll be able to access all features of Expanders360.</p>
          
          <p>Best regards,<br>Expanders360 Team</p>
          
          <hr style="margin-top: 30px;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Registration OTP email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending registration OTP email:', error);
      throw new Error('Failed to send registration OTP email');
    }
  }
}

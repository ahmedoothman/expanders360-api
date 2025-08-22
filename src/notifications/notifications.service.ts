import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Match } from '../matches/match.entity';

@Injectable()
export class NotificationsService {
  constructor(private configService: ConfigService) {}

  async sendMatchNotification(
    projectId: number,
    matches: Match[],
  ): Promise<void> {
    // Mock email service - replace with real SMTP later
    console.log(`📧 Sending notification for project ${projectId}`);
    console.log(`Found ${matches.length} new matches:`, matches);

    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    // For now, using a mock email until we have proper client data
    const clientEmail =
      this.configService.get<string>('ADMIN_EMAIL') || 'admin@example.com';

    await transporter.sendMail({
      to: clientEmail,
      subject: 'New Vendor Matches Found',
      html: `<h2>We found ${matches.length} new vendors for your project!</h2>`,
    });
  }
}

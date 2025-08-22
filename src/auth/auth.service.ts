import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/services/email.service';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { VerifyRegistrationOtpDto } from './dto/verify-registration-otp.dto';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const validatedUser = await this.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!validatedUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!validatedUser.is_email_verified) {
      throw new UnauthorizedException('Please verify your email address first');
    }

    const user = validatedUser;

    const payload = {
      email: user.contact_email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        company_name: user.company_name,
        contact_email: user.contact_email,
        role: user.role,
      },
    };
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; user: UserWithoutPassword }> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate OTP for email verification
    const otp = this.generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 15); // OTP expires in 15 minutes

    // Store email verification OTP
    await this.usersService.updateEmailVerificationOtp(
      user.id,
      otp,
      otpExpiresAt,
    );

    // Send registration OTP email
    try {
      await this.emailService.sendRegistrationOtpEmail(
        user.contact_email,
        otp,
        user.company_name,
      );
    } catch (error) {
      console.error('Failed to send registration OTP email:', error);
      throw new BadRequestException(
        'Failed to send verification email. Please try again.',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return {
      message:
        'Registration successful! Please check your email for verification OTP.',
      user: result,
    };
  }

  // Generate a random 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send forgot password OTP
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new UnauthorizedException('User with this email does not exist');
    }

    const otp = this.generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 15); // OTP expires in 15 minutes

    // Update user with OTP and expiration
    await this.usersService.updateOtp(user.id, otp, otpExpiresAt);

    // Send OTP via email
    try {
      await this.emailService.sendOtpEmail(user.contact_email, otp);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new BadRequestException(
        'Failed to send OTP email. Please try again.',
      );
    }

    return {
      message: 'OTP sent to your email address',
    };
  }

  // Verify OTP
  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ message: string; isValid: boolean }> {
    const user = await this.usersService.findByEmail(verifyOtpDto.email);
    if (!user) {
      throw new UnauthorizedException('User with this email does not exist');
    }

    if (!user.reset_password_otp || !user.otp_expires_at) {
      throw new BadRequestException('No OTP found for this user');
    }

    if (new Date() > user.otp_expires_at) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.reset_password_otp !== verifyOtpDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    return {
      message: 'OTP verified successfully',
      isValid: true,
    };
  }

  // Reset password with OTP
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    // First verify the OTP
    await this.verifyOtp({
      email: resetPasswordDto.email,
      otp: resetPasswordDto.otp,
    });

    const user = await this.usersService.findByEmail(resetPasswordDto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Update password and clear OTP
    await this.usersService.updatePasswordAndClearOtp(user.id, hashedPassword);

    return {
      message: 'Password reset successfully',
    };
  }

  // Update password (for authenticated users)
  async updatePassword(
    userId: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      10,
    );
    await this.usersService.updatePassword(user.id, hashedNewPassword);

    return {
      message: 'Password updated successfully',
    };
  }

  // Verify registration email OTP
  async verifyRegistrationOtp(
    verifyRegistrationOtpDto: VerifyRegistrationOtpDto,
  ): Promise<{
    message: string;
    access_token?: string;
    user?: UserWithoutPassword;
  }> {
    const user = await this.usersService.findByEmail(
      verifyRegistrationOtpDto.email,
    );
    if (!user) {
      throw new UnauthorizedException('User with this email does not exist');
    }

    if (user.is_email_verified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!user.email_verification_otp || !user.email_otp_expires_at) {
      throw new BadRequestException('No verification OTP found for this user');
    }

    if (new Date() > user.email_otp_expires_at) {
      throw new BadRequestException('Verification OTP has expired');
    }

    if (user.email_verification_otp !== verifyRegistrationOtpDto.otp) {
      throw new BadRequestException('Invalid verification OTP');
    }

    // Activate the account
    await this.usersService.verifyEmailAndActivate(user.id);

    // Generate JWT token for immediate login
    const payload = {
      email: user.contact_email,
      sub: user.id,
      role: user.role,
    };

    // Send welcome email after successful verification
    this.emailService
      .sendWelcomeEmail(user.contact_email, user.company_name)
      .catch((error) => console.error('Failed to send welcome email:', error));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    return {
      message: 'Email verified successfully! Welcome to Expanders360!',
      access_token: this.jwtService.sign(payload),
      user: { ...result, is_email_verified: true },
    };
  }
}

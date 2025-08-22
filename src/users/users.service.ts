import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { contact_email: createUserDto.contact_email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'company_name',
        'contact_email',
        'role',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'company_name',
        'contact_email',
        'role',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { contact_email: email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (
      updateUserDto.contact_email &&
      updateUserDto.contact_email !== user.contact_email
    ) {
      const existingUser = await this.usersRepository.findOne({
        where: { contact_email: updateUserDto.contact_email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User deleted successfully',
    };
  }

  // Find user by ID including password for authentication
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  // Update user with OTP and expiration time
  async updateOtp(id: number, otp: string, expiresAt: Date): Promise<void> {
    await this.usersRepository.update(id, {
      reset_password_otp: otp,
      otp_expires_at: expiresAt,
    });
  }

  // Update password only
  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(id, {
      password: hashedPassword,
    });
  }

  // Update password and clear OTP fields
  async updatePasswordAndClearOtp(
    id: number,
    hashedPassword: string,
  ): Promise<void> {
    await this.usersRepository.update(id, {
      password: hashedPassword,
      reset_password_otp: undefined,
      otp_expires_at: undefined,
    });
  }

  // Update user with email verification OTP
  async updateEmailVerificationOtp(
    id: number,
    otp: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(id, {
      email_verification_otp: otp,
      email_otp_expires_at: expiresAt,
    });
  }

  // Verify email and activate account
  async verifyEmailAndActivate(id: number): Promise<void> {
    await this.usersRepository.update(id, {
      is_email_verified: true,
      email_verification_otp: undefined,
      email_otp_expires_at: undefined,
    });
  }
}

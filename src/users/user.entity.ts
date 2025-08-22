import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
}

@Entity('clients')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  company_name: string;

  @Column({ unique: true })
  contact_email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  reset_password_otp: string;

  @Column({ nullable: true })
  otp_expires_at: Date;

  @Column({ nullable: true })
  email_verification_otp: string;

  @Column({ nullable: true })
  email_otp_expires_at: Date;

  @Column({ default: false })
  is_email_verified: boolean;

  @OneToMany(() => Project, (project) => project.client)
  projects: Project[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

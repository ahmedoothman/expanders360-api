import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Match } from '../matches/match.entity';

export enum ProjectStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  country: string;

  @Column('json')
  services_needed: string[];

  @Column('decimal', { precision: 12, scale: 2 })
  budget: number;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @ManyToOne(() => User, (user) => user.projects, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  client: User;

  @OneToMany(() => Match, (match) => match.project)
  matches: Match[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

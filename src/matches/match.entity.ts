import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { Vendor } from '../vendors/vendor.entity';

@Entity('matches')
@Index(['project_id', 'vendor_id'], { unique: true })
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_id: number;

  @Column()
  vendor_id: number;

  @Column('decimal', { precision: 5, scale: 2 })
  score: number;

  @ManyToOne(() => Project, (project) => project.matches)
  project: Project;

  @ManyToOne(() => Vendor, (vendor) => vendor.matches)
  vendor: Vendor;

  @CreateDateColumn()
  created_at: Date;
}

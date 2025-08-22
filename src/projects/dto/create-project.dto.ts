import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { ProjectStatus } from '../project.entity';

export class CreateProjectDto {
  @IsNumber()
  client_id: number;

  @IsNotEmpty()
  country: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  services_needed: string[];

  @IsNumber()
  @Min(0)
  budget: number;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

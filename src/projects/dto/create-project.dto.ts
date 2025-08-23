import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  IsString,
  IsPositive,
} from 'class-validator';
import { ProjectStatus } from '../project.entity';

export class CreateProjectDto {
  @IsNumber()
  @IsPositive()
  client_id: number;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  services_needed: string[];

  @IsNumber()
  @Min(0)
  budget: number;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

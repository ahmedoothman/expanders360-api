import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateMatchDto {
  @IsNumber()
  project_id: number;

  @IsOptional()
  @IsNumber()
  vendor_id?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;
}

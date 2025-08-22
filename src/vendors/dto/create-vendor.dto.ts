import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateVendorDto {
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  countries_supported: string[];

  @IsArray()
  @IsNotEmpty({ each: true })
  services_offered: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  response_sla_hours?: number;
}

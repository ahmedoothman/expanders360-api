import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDocumentDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  projectId: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  fileSize?: number;

  @IsOptional()
  mimeType?: string;
}

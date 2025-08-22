import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNumber()
  projectId: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  mimeType?: string;
}

import { IsOptional, IsArray, IsNumber } from 'class-validator';

export class SearchDocumentsDto {
  @IsOptional()
  query?: string;

  @IsOptional()
  @IsNumber()
  projectId?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

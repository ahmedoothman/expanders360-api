import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { multerConfig } from '../config/multer.config';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    if (file) {
      createDocumentDto.fileSize = file.size;
      createDocumentDto.mimeType = file.mimetype;
      // File is now saved to disk, store the relative path
      createDocumentDto.fileUrl = `/uploads/${file.filename}`;
    }
    return this.documentsService.create(createDocumentDto);
  }

  @Get('search')
  search(@Query() searchDto: SearchDocumentsDto) {
    if (searchDto.query) {
      return this.documentsService.search(searchDto.query, searchDto.projectId);
    }
    if (searchDto.tags && searchDto.tags.length > 0) {
      return this.documentsService.findByTags(
        searchDto.tags,
        searchDto.projectId,
      );
    }
    if (searchDto.projectId) {
      return this.documentsService.findByProject(searchDto.projectId);
    }
    return [];
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.documentsService.findByProject(+projectId);
  }
}

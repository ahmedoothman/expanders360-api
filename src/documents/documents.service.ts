import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResearchDocument, ResearchDoc } from './document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';

interface SearchCriteria {
  $text?: { $search: string };
  projectId?: number;
  tags?: { $in: string[] };
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(ResearchDoc.name)
    private documentModel: Model<ResearchDocument>,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
  ): Promise<ResearchDocument> {
    const document = new this.documentModel(createDocumentDto);
    return document.save();
  }

  async findByProject(projectId: number): Promise<ResearchDocument[]> {
    return this.documentModel.find({ projectId }).exec();
  }

  async search(query: string, projectId?: number): Promise<ResearchDocument[]> {
    const searchCriteria: SearchCriteria = {
      $text: { $search: query },
    };

    if (projectId) {
      searchCriteria.projectId = projectId;
    }

    return this.documentModel.find(searchCriteria).exec();
  }

  async findByTags(
    tags: string[],
    projectId?: number,
  ): Promise<ResearchDocument[]> {
    const searchCriteria: SearchCriteria = {
      tags: { $in: tags },
    };

    if (projectId) {
      searchCriteria.projectId = projectId;
    }

    return this.documentModel.find(searchCriteria).exec();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  countByCountry(_countries: string[]): { [country: string]: number } {
    // This requires joining with projects from MySQL
    // We'll implement this in the analytics service
    return {};
  }
}

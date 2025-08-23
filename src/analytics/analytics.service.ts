import { Injectable } from '@nestjs/common';
import { MatchesService } from '../matches/matches.service';
import { DocumentsService } from '../documents/documents.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    private matchesService: MatchesService,
    private documentsService: DocumentsService,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async getTopVendorsByCountry() {
    // Get top vendors from MySQL
    const topVendors = await this.matchesService.getTopVendorsByCountry(30);

    // Get document counts by country from MongoDB
    const countries = Object.keys(topVendors);
    const documentCounts = await this.getDocumentCountsByCountry(countries);

    // Combine the data
    const result: Record<string, { top_vendors: any; document_count: number }> =
      {};
    for (const country of countries) {
      result[country] = {
        top_vendors: topVendors[country],
        document_count: documentCounts[country] ?? 0,
      };
    }

    return result;
  }

  private async getDocumentCountsByCountry(
    countries: string[],
  ): Promise<Record<string, number>> {
    const result: Record<string, number> = {};

    for (const country of countries) {
      // Get project IDs for this country
      const projects = await this.projectRepository.find({
        where: { country },
        select: ['id'],
      });

      const projectIds = projects.map((p) => p.id);

      // Count documents for these projects
      const count = await this.documentsService['documentModel']
        .countDocuments({ projectId: { $in: projectIds } })
        .exec();

      result[country] = count;
    }

    return result;
  }
}

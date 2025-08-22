import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { Project } from '../projects/project.entity';
import { Vendor } from '../vendors/vendor.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async rebuildMatches(projectId: number): Promise<Match[]> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Find eligible vendors
    const vendors = await this.vendorRepository
      .createQueryBuilder('vendor')
      .where(':country = ANY(vendor.countries_supported)', {
        country: project.country,
      })
      .getMany();

    const matches: Match[] = [];

    for (const vendor of vendors) {
      const serviceOverlap = this.calculateServiceOverlap(
        project.services_needed,
        vendor.services_offered,
      );

      if (serviceOverlap > 0) {
        const score = this.calculateMatchScore(vendor, serviceOverlap);

        // Upsert match
        const existingMatch = await this.matchRepository.findOne({
          where: { project_id: projectId, vendor_id: vendor.id },
        });

        if (existingMatch) {
          existingMatch.score = score;
          await this.matchRepository.save(existingMatch);
          matches.push(existingMatch);
        } else {
          const newMatch = this.matchRepository.create({
            project_id: projectId,
            vendor_id: vendor.id,
            score,
          });
          const savedMatch = await this.matchRepository.save(newMatch);
          matches.push(savedMatch);
        }
      }
    }

    return matches;
  }

  private calculateServiceOverlap(
    projectServices: string[],
    vendorServices: string[],
  ): number {
    const overlap = projectServices.filter((service) =>
      vendorServices.includes(service),
    );
    return overlap.length;
  }

  private calculateMatchScore(vendor: Vendor, serviceOverlap: number): number {
    const slaWeight = vendor.response_sla_hours <= 24 ? 1 : 0.5;
    return serviceOverlap * 2 + vendor.rating + slaWeight;
  }

  async getTopVendorsByCountry(days: number = 30): Promise<
    Record<
      string,
      Array<{
        vendor_id: number;
        vendor_name: string;
        avg_score: number;
      }>
    >
  > {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    interface RawVendorResult {
      country: string;
      vendor_id: string;
      vendor_name: string;
      avg_score: string;
    }

    const topVendors: RawVendorResult[] = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoin('match.vendor', 'vendor')
      .leftJoin('match.project', 'project')
      .select([
        'project.country as country',
        'vendor.id as vendor_id',
        'vendor.name as vendor_name',
        'AVG(match.score) as avg_score',
      ])
      .where('match.created_at >= :cutoffDate', { cutoffDate })
      .groupBy('project.country, vendor.id, vendor.name')
      .orderBy('project.country, avg_score', 'DESC')
      .getRawMany();

    // Group by country and take top 3
    const result: Record<
      string,
      Array<{
        vendor_id: number;
        vendor_name: string;
        avg_score: number;
      }>
    > = {};

    topVendors.forEach((vendor) => {
      if (!result[vendor.country]) {
        result[vendor.country] = [];
      }
      if (result[vendor.country].length < 3) {
        result[vendor.country].push({
          vendor_id: parseInt(vendor.vendor_id, 10),
          vendor_name: vendor.vendor_name,
          avg_score: parseFloat(vendor.avg_score),
        });
      }
    });

    return result;
  }
}

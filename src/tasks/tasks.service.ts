import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../projects/project.entity';
import { MatchesService } from '../matches/matches.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private matchesService: MatchesService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async refreshMatches() {
    this.logger.log('Starting daily match refresh...');

    const activeProjects = await this.projectRepository.find({
      where: { status: ProjectStatus.ACTIVE },
    });

    for (const project of activeProjects) {
      try {
        const matches = await this.matchesService.rebuildMatches(project.id);
        await this.notificationsService.sendMatchNotification(
          project.id,
          matches,
        );
      } catch (error) {
        this.logger.error(
          `Failed to refresh matches for project ${project.id}:`,
          error,
        );
      }
    }

    this.logger.log(`Refreshed matches for ${activeProjects.length} projects`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  checkVendorSLAs() {
    this.logger.log('Checking vendor SLAs...');
    // Implementation for SLA checking
  }
}

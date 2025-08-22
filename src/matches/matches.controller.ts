import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    // For manual match creation, calculate score automatically
    return this.matchesService.rebuildMatches(createMatchDto.project_id);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.matchesService.rebuildMatches(projectId);
  }

  @Post('rebuild/:projectId')
  rebuildMatches(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.matchesService.rebuildMatches(projectId);
  }

  @Get('analytics/top-vendors')
  getTopVendorsByCountry() {
    return this.matchesService.getTopVendorsByCountry();
  }
}

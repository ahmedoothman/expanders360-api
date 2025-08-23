import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // First, validate that the client exists
    const client = await this.usersRepository.findOne({
      where: { id: createProjectDto.client_id },
    });

    if (!client) {
      throw new BadRequestException(
        `Client with ID ${createProjectDto.client_id} not found`,
      );
    }

    // Create project with the validated client
    const project = this.projectsRepository.create({
      ...createProjectDto,
      client: client,
    });

    return this.projectsRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      relations: ['client'],
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async findByClient(clientId: number): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { client: { id: clientId } },
      relations: ['client'],
    });
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { status },
      relations: ['client'],
    });
  }

  async findByCountry(country: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { country },
      relations: ['client'],
    });
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    await this.findOne(id); // Check if project exists
    await this.projectsRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.projectsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Project not found');
    }
  }
}

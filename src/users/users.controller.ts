import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // Only admin users can access ALL endpoints
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Removed POST /users - users should register via /auth/register
  // This prevents bypassing email verification and password hashing

  @Get()
  async findAll() {
    return {
      status: 'success',
      data: await this.usersService.findAll(),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      status: 'success',
      data: await this.usersService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return {
      status: 'success',
      data: await this.usersService.update(id, updateUserDto),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return {
      status: 'success',
      data: await this.usersService.remove(id),
    };
  }
}

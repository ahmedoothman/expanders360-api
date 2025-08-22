import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  async create(@Body() createVendorDto: CreateVendorDto) {
    return {
      status: 'success',
      data: await this.vendorsService.create(createVendorDto),
    };
  }

  @Get()
  async findAll(
    @Query('country') country?: string,
    @Query('service') service?: string,
  ) {
    if (country) {
      return this.vendorsService.findByCountry(country);
    }
    if (service) {
      return this.vendorsService.findByService(service);
    }
    return {
      status: 'success',
      data: await this.vendorsService.findAll(),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      status: 'success',
      data: await this.vendorsService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return {
      status: 'success',
      data: await this.vendorsService.update(id, updateVendorDto),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return {
      status: 'success',
      data: await this.vendorsService.remove(id),
    };
  }
}

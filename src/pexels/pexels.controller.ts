import { Controller, Get, Query } from '@nestjs/common';
import { PexelsService } from './pexels.service';

@Controller('pexels')
export class PexelsController {
  constructor(private readonly pexelsService: PexelsService) {}

  @Get()
  async getPhoto(
    @Query('about') about: string,
    @Query('orientation') orientation?: string,
    @Query('size') size?: 'large' | 'medium' | 'small',
  ): Promise<any> {
    return this.pexelsService.getPhoto(about, orientation, size);
  }
}

import { Module } from '@nestjs/common';
import { PexelsService } from './pexels.service';
import { PexelsController } from './pexels.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [PexelsController],
  providers: [PexelsService, ConfigService],
})
export class PexelsModule {}

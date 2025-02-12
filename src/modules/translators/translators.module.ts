import { Module } from '@nestjs/common';
import { TranslatorsService } from './translators.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [TranslatorsService, ConfigService],
})
export class TranslatorsModule { }

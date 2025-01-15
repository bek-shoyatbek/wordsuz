import { Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [TranslatorService, ConfigService],
})
export class TranslatorModule { }

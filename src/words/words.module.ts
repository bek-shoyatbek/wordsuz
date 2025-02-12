import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TranslatorsService } from 'src/translators/translators.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10 * 1000,
    }),
  ],
  controllers: [WordsController],
  providers: [WordsService, ConfigService, TranslatorsService],
})
export class WordModule { }

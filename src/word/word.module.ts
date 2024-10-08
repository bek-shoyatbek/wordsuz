import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { WordController } from './word.controller';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TranslatorService } from 'src/translator/translator.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10 * 1000,
    }),
  ],
  controllers: [WordController],
  providers: [WordService, ConfigService, TranslatorService],
})
export class WordModule {}

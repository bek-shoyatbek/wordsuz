import { Module } from '@nestjs/common';
import { TranslatorController } from './translator.controller';
import { TranslatorService } from './translator.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DictionaryService } from 'src/dictionary/dictionary.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  controllers: [TranslatorController],
  providers: [
    TranslatorService,
    PrismaService,
    DictionaryService,
    ConfigService,
  ],
})
export class TranslatorModule {}

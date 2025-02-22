import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TranslatorsService } from '../translators/translators.service';
import { DatabaseModule } from 'src/shared/database/database.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10 * 1000,
    }),
    DatabaseModule,
  ],
  controllers: [WordsController],
  providers: [WordsService, ConfigService, TranslatorsService],
})
export class WordModule {}

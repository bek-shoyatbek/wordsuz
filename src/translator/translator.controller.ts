import { Controller, Get, Param } from '@nestjs/common';
import { TranslatorService } from './translator.service';

@Controller('translator')
export class TranslatorController {
  constructor(private translatorService: TranslatorService) {}

  @Get(':word')
  async translateWord(@Param('word') word: string) {
    return this.translatorService.translateWord(word);
  }
}

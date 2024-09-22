import { Controller, Get, Param } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';

@Controller('dictionary')
export class DictionaryController {
  constructor(private dictionaryService: DictionaryService) {}

  @Get(':word')
  getDefinition(@Param('word') word: string) {
    return this.dictionaryService.getWordDefinition(word);
  }
}

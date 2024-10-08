import { Controller, Get, Param, Query } from '@nestjs/common';
import { WordService } from './word.service';

@Controller('word')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Get(':word')
  async getWord(@Param('word') word: string, @Query('method') method: string) {
    switch (method) {
      case 'synonyms':
        return await this.wordService.getSynonyms(word);
      case 'examples':
        return await this.wordService.getExamples(word);
      case 'frequency':
        return await this.wordService.getFrequencyOfUse(word);
      default:
        return await this.wordService.getWord(word);
    }
  }
}

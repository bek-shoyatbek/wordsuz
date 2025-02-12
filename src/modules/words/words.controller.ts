import { Controller, Get, Param } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) { }

  @Get(':word')
  async getWord(@Param('word') word: string) {
    return await this.wordsService.getWord(word);
  }
}

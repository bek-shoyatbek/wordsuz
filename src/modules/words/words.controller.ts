import { Controller, Get, Param } from '@nestjs/common';
import { WordsService } from './words.service';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { wordDetailsExample } from './examples';

@ApiTags('Words')
@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @ApiParam({
    name: 'word',
    type: 'string',
    description: 'A word to get details',
  })
  @ApiOkResponse({ schema: { type: 'object', example: wordDetailsExample } })
  @Get(':word')
  async getWord(@Param('word') word: string) {
    return await this.wordsService.getWord(word);
  }
}

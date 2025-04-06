import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { WordsService } from './words.service';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { wordDetailsExample } from './examples';

@ApiTags('Words')
@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) { }

  @ApiParam({
    name: 'wordId',
    type: 'string',
    description: 'enter a wordId to get it',
  })
  @Get('single/:wordId')
  async getWordById(
    @Param('wordId', new ParseUUIDPipe({ version: '4' })) wordId: string,
  ) {
    return this.wordsService.getWordById(wordId);
  }

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

  @ApiParam({
    name: 'word',
    type: 'string',
    description: 'part of a word to get similar words',
  })
  @ApiOkResponse({ schema: { type: 'array' } })
  @Get('admins/:word')
  async getSimilarWords(@Param('word') word: string) {
    return await this.wordsService.getSimilarWordsFromDB(word);
  }
}

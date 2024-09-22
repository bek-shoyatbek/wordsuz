import { Controller, Get, Param } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { Observable } from 'rxjs';
import { WordDefinitionResponse } from '../interfaces/word-definition.interface';

@Controller('dictionary')
export class DictionaryController {
  constructor(private dictionaryService: DictionaryService) {}

  @Get(':word')
  getWordDefinition(
    @Param('word') word: string,
  ): Observable<WordDefinitionResponse> {
    return this.dictionaryService.getWordDefinition(word);
  }
}

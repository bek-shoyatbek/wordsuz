import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { map, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { WordDefinitionResponse } from '../interfaces/word-definition.interface';

@Injectable()
export class DictionaryService {
  private readonly dictionaryApiUrl: string;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.dictionaryApiUrl = this.configService.get('DICTIONARY_API_URL');
  }

  getWordDefinition(word: string): Observable<WordDefinitionResponse> {
    const apiUrl = `${this.dictionaryApiUrl}/${word}`;
    return this.httpService.get(apiUrl).pipe(map((response) => response.data));
  }
}

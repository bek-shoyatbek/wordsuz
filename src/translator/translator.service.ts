import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DictionaryService } from 'src/dictionary/dictionary.service';
import { WordDefinition } from 'src/interfaces/word-definition.interface';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { MyMemoryResponse } from 'src/interfaces/my-memory-response.interface';
import { createClient } from 'pexels';

@Injectable()
export class TranslatorService {
  private readonly myMemoryApiUrl: string;

  constructor(
    private dictionaryService: DictionaryService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.myMemoryApiUrl = this.configService.get('MY_MEMORY_API_URL');
  }

  async translateWord(word: string): Promise<any> {
    const wordDefinition = await this.dictionaryService
      .getWordDefinition(word)
      .toPromise();

    if (!wordDefinition || wordDefinition.length === 0) {
      throw new Error('Word not found');
    }

    const existingWord = await this.prisma.word.findUnique({
      where: { english: word },
      include: { meanings: { include: { examples: true } } },
    });

    if (existingWord) {
      return this.formatTranslation(existingWord, wordDefinition[0]);
    }

    // If the word doesn't exist, create it with translations from MyMemory API
    const uzbekTranslation = await this.translateWithMyMemory(word);
    const newWord = await this.prisma.word.create({
      data: {
        english: wordDefinition[0].word,
        uzbek: uzbekTranslation,
        meanings: {
          create: await Promise.all(
            wordDefinition[0].meanings.map(async (meaning) => ({
              text: await this.translateWithMyMemory(
                meaning.definitions[0].definition,
              ),
              examples: {
                create: await Promise.all(
                  meaning.definitions
                    .filter((def) => def.example)
                    .map(async (def) => ({
                      text: await this.translateWithMyMemory(def.example),
                    })),
                ),
              },
            })),
          ),
        },
      },
      include: { meanings: { include: { examples: true } } },
    });

    return this.formatTranslation(newWord, wordDefinition[0]);
  }

  private async translateWithMyMemory(text: string): Promise<string> {
    const encodedText = encodeURIComponent(text);
    const url = `${this.myMemoryApiUrl}?q=${encodedText}&langpair=en|uz`;

    try {
      const response = await lastValueFrom(
        this.httpService
          .get<MyMemoryResponse>(url)
          .pipe(map((response) => response.data)),
      );

      return response.responseData.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return 'Translation error';
    }
  }
  private formatTranslation(dbWord: any, apiWord: WordDefinition) {
    return {
      word: dbWord.english,
      uzbekTranslation: dbWord.uzbek,
      phonetic: apiWord.phonetic,
      origin: apiWord.origin,
      meanings: apiWord.meanings.map((meaning, index) => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map((def) => ({
          definition: def.definition,
          example: def.example,
          uzMeaning: dbWord.meanings[index]?.text || 'Translation needed',
          uzExample:
            dbWord.meanings[index]?.examples.find(
              (e: { text: string }) => e.text === def.example,
            )?.text || 'Translation needed',
        })),
      })),
    };
  }
}

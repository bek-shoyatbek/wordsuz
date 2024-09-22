import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, from, of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DictionaryService {
  private readonly dictionaryApiUrl =
    'https://api.dictionaryapi.dev/api/v2/entries/en';
  private readonly translationApiUrl = 'YOUR_TRANSLATION_API_URL'; // Replace with actual translation API URL

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  getWordDefinition(word: string): Observable<any> {
    return from(
      this.prisma.word.findUnique({
        where: { englishWord: word },
        include: { meanings: true, examples: true, comments: true },
      }),
    ).pipe(
      mergeMap((existingWord) => {
        if (existingWord) {
          return of(existingWord);
        } else {
          return this.fetchTranslateAndSaveWord(word);
        }
      }),
      catchError((error) => {
        console.error('Error in getWordDefinition:', error);
        throw new HttpException(
          'An error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    );
  }

  private fetchTranslateAndSaveWord(word: string): Observable<any> {
    return this.httpService.get(`${this.dictionaryApiUrl}/${word}`).pipe(
      mergeMap((response) => {
        const englishData = response.data[0];
        return this.translateToUzbek(englishData).pipe(
          map((uzbekTranslations) => ({ englishData, uzbekTranslations })),
        );
      }),
      mergeMap(({ englishData, uzbekTranslations }) => {
        const wordData = this.combineTranslations(
          englishData,
          uzbekTranslations,
        );
        return from(
          this.prisma.word.create({
            data: {
              englishWord: englishData.word,
              meanings: {
                create: wordData.meanings,
              },
              examples: {
                create: wordData.examples,
              },
            },
            include: { meanings: true, examples: true },
          }),
        );
      }),
      catchError((error: AxiosError) => {
        if (error.response?.status === 404) {
          throw new HttpException('Word not found', HttpStatus.NOT_FOUND);
        }
        throw new HttpException(
          'An error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    );
  }

  private translateToUzbek(englishData: any): Observable<string[]> {
    const definitionsToTranslate = englishData.meanings.flatMap((meaning) =>
      meaning.definitions.map((def) => def.definition),
    );

    // Placeholder for translation API call
    return this.httpService
      .post(this.translationApiUrl, {
        texts: definitionsToTranslate,
        targetLanguage: 'uz',
      })
      .pipe(
        map((response) => response.data.translations),
        catchError((error) => {
          console.error('Translation error:', error);
          return of(definitionsToTranslate.map(() => 'Translation failed'));
        }),
      );
  }

  private combineTranslations(
    englishData: any,
    uzbekTranslations: string[],
  ): any {
    let translationIndex = 0;
    const meanings = englishData.meanings.map((meaning) => ({
      partOfSpeech: meaning.partOfSpeech,
      definitions: meaning.definitions.map((def) => ({
        englishDefinition: def.definition,
        uzbekDefinition:
          uzbekTranslations[translationIndex++] || 'Translation not available',
      })),
    }));

    const examples = englishData.meanings.flatMap((meaning) =>
      meaning.definitions
        .filter((def) => def.example)
        .map((def) => ({
          englishSentence: def.example,
          uzbekSentence: '', // To be filled later
        })),
    );

    return { meanings, examples };
  }

  updateUzbekTranslation(
    wordId: string,
    meaningIndex: number,
    definitionIndex: number,
    uzbekTranslation: string,
  ): Observable<any> {
    return from(
      this.prisma.word.findUnique({
        where: { id: wordId },
        include: { meanings: true },
      }),
    ).pipe(
      mergeMap((word) => {
        if (!word) {
          throw new HttpException('Word not found', HttpStatus.NOT_FOUND);
        }
        const meaningId = word.meanings[meaningIndex]?.id;
        if (!meaningId) {
          throw new HttpException('Meaning not found', HttpStatus.NOT_FOUND);
        }
        return from(
          this.prisma.meaning.update({
            where: { id: meaningId },
            data: {
              definitions: {
                updateMany: {
                  where: {
                    id: word.meanings[meaningIndex].definitions[definitionIndex]
                      ?.id,
                  },
                  data: { uzbekDefinition: uzbekTranslation },
                },
              },
            },
          }),
        );
      }),
      catchError((error) => {
        console.error('Error in updateUzbekTranslation:', error);
        throw new HttpException(
          'An error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    );
  }
}

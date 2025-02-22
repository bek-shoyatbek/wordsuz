import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { TranslatorsService } from '../translators/translators.service';
import { WordApiResponse } from 'src/shared/types';
import { WordDetails } from './types';

@Injectable()
export class WordsService {
  private readonly wordsApiURL: string;
  private readonly wordsApiKey: string;
  private readonly wordsApiHost: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly translator: TranslatorsService,
  ) {
    this.wordsApiURL = this.configService.get('WORDS_API_URL');
    this.wordsApiKey = this.configService.get('WORDS_API_KEY');
    this.wordsApiHost = this.configService.get('WORDS_API_HOST');
  }

  async getWord(word: string) {
    const apiResponse = await this.getWordDetails(word);
    return await this.transformWordResponse(apiResponse);
  }

  private async getWordDetails(word: string) {
    const reqOptions = this.generateRequestOptions('GET');
    reqOptions.url = `${this.wordsApiURL}/${word}`;
    try {
      const response = await this.httpService.axiosRef.request(reqOptions);
      return response.data;
    } catch (error) {
      console.error('Error fetching word details:', error);
      throw new Error('Failed to fetch word details');
    }
  }

  private generateRequestOptions(method: 'GET' | 'POST'): AxiosRequestConfig {
    const options: AxiosRequestConfig = {
      method: method,
      url: '',
      headers: {
        'x-rapidapi-key': this.wordsApiKey,
        'x-rapidapi-host': this.wordsApiHost,
      },
    };
    return options;
  }

  private generateVerbForms(word: string) {
    return [
      {
        tense: 'simple',
        content: [
          {
            title: 'Present Simple',
            forms: [
              {
                singular: `I ${word}`,
                plural: `We ${word}`,
              },
              {
                singular: `You ${word}`,
                plural: `You ${word}`,
              },
              {
                singular: `He/She/It ${word}s`,
                plural: `They ${word}`,
              },
            ],
          },
          {
            title: 'Past Simple',
            forms: [
              {
                singular: `I ${word}ed`,
                plural: `We ${word}ed`,
              },
              {
                singular: `You ${word}ed`,
                plural: `You ${word}ed`,
              },
              {
                singular: `He/She/It ${word}ed`,
                plural: `They ${word}ed`,
              },
            ],
          },
          {
            title: 'Future Simple',
            forms: [
              {
                singular: `I will ${word}`,
                plural: `We will ${word}`,
              },
              {
                singular: `You will ${word}`,
                plural: `You will ${word}`,
              },
              {
                singular: `He/She/It will ${word}`,
                plural: `They will ${word}`,
              },
            ],
          },
        ],
      },
    ];
  }

  private async transformWordResponse(
    apiResponse: WordApiResponse,
  ): Promise<WordDetails> {
    const { word, results, pronunciation, frequency } = apiResponse;

    const translatedWord = await this.translator.translate(word, 'en', 'uz');

    const definitionsByType = results.reduce((acc, curr) => {
      if (!acc[curr.partOfSpeech]) {
        acc[curr.partOfSpeech] = [];
      }
      acc[curr.partOfSpeech].push(curr);
      return acc;
    }, {});

    const translatedDefinitions = await Promise.all(
      Object.entries(definitionsByType).map(async ([type, defs]) => {
        const typeUz = await this.translator.translate(type, 'en', 'uz');
        const meaningUz = await this.translator.translate(
          defs[0].definition,
          'en',
          'uz',
        );

        const others = await Promise.all(
          (defs as any).slice(1).map(async (def) => ({
            meaning: await this.translator.translate(
              def.definition,
              'en',
              'uz',
            ),
            examples: await Promise.all(
              (def.examples || []).map(async (example) => ({
                phrase: example,
                translation: await this.translator.translate(
                  example,
                  'en',
                  'uz',
                ),
              })),
            ),
          })),
        );

        return {
          typeEn: type,
          typeUz,
          meaning: meaningUz,
          plural: '', // Add plural translation if needed
          others,
        };
      }),
    );

    const translatedExamples = await Promise.all(
      results.flatMap((result) =>
        (result.examples || []).map(async (example) => ({
          phrase: example,
          translation: await this.translator.translate(example, 'en', 'uz'),
        })),
      ),
    );

    const allSynonyms = Array.from(
      new Set(results.flatMap((result) => result.synonyms || [])),
    );
    const translatedSynonyms = await Promise.all(
      allSynonyms.map(
        async (synonym) => await this.translator.translate(synonym, 'en', 'uz'),
      ),
    );

    const hasVerbDefinition = results.some(
      (result) => result.partOfSpeech === 'verb',
    );
    const verbForms = hasVerbDefinition ? this.generateVerbForms(word) : [];

    const transformedResponse: WordDetails = {
      title: translatedWord,
      transcription: pronunciation?.all || '',
      definitions: translatedDefinitions,
      usageFrequency: Math.round(frequency * 100) || 0,
      synonyms: translatedSynonyms,
      examples: translatedExamples,
      verbforms: verbForms,
      anagrams: [], // Add anagram translation if needed
    };

    return transformedResponse;
  }
}

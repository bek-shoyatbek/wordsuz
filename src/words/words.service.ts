import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { TranslatorsService } from 'src/translators/translators.service';
import { WordApiResponse } from 'src/shared/types';

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

    return this.transformWordResponse(apiResponse);

  }

  private async getWordDetails(word: string) {
    const reqOptions = this.generateRequestOptions('GET');
    reqOptions.url = `${this.wordsApiURL}/${word}`;
    try {
      const response = await lastValueFrom(
        this.httpService.request(reqOptions),
      );
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

  private transformWordResponse(apiResponse: WordApiResponse) {
    const {
      word,
      results,
      pronunciation,
      frequency,
    } = apiResponse;

    const definitionsByType = results.reduce((acc, curr) => {
      if (!acc[curr.partOfSpeech]) {
        acc[curr.partOfSpeech] = [];
      }
      acc[curr.partOfSpeech].push(curr);
      return acc;
    }, {});

    const hasVerbDefinition = results.some(result => result.partOfSpeech === 'verb');

    const allSynonyms = Array.from(
      new Set(
        results
          .flatMap(result => result.synonyms || [])
      )
    );

    const allExamples = results
      .flatMap(result =>
        (result.examples || []).map(example => ({
          phrase: example,
          translation: ''
        }))
      );

    const transformedResponse = {
      title: word,
      transcription: pronunciation?.all || '',
      definitions: Object.entries(definitionsByType).map(([type, defs]) => ({
        typeEn: type,
        typeUz: '',
        meaning: defs[0].definition,
        plural: '',
        others: (defs as any).slice(1).map(def => ({
          meaning: def.definition,
          examples: []
        }))
      })),
      usageFrequency: Math.round(frequency * 100) || 0,
      synonyms: allSynonyms,
      examples: allExamples,
      verbforms: hasVerbDefinition ? this.generateVerbForms(word) : [],
      anagrams: []
    };

    return transformedResponse;
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

}

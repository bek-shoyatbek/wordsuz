import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { TranslatorsService } from 'src/modules/translators/translators.service';
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

    const toTranslate = await this.translator.prepareTranslationString(apiResponse);

    const translatedString = await this.translator.translate(toTranslate, 'en', 'uz');

    const uzbekData = this.translator.parseTranslatedString(translatedString);

    return this.transformToFinalFormat(apiResponse, uzbekData);
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

  private transformToFinalFormat(apiResponse: WordApiResponse, uzbekData: any) {
    const uniqueSynonyms = Array.from(new Set(
      apiResponse.results?.flatMap(result => result.synonyms || []) || []
    ));

    const definitions = apiResponse.results?.map((result, index) => {
      const uzTranslation = uzbekData.translations[index];

      return {
        typeEn: result.partOfSpeech,
        typeUz: uzTranslation?.partOfSpeech || '',
        meaning: uzTranslation?.definition || '',
        plural: '',
        others: result.examples?.map((example, i) => ({
          meaning: uzTranslation?.examples?.[i]?.translated || '',
          examples: [{
            phrase: example,
            translation: uzTranslation?.examples?.[i]?.translated || ''
          }]
        })) || []
      };
    }) || [];

    const examples = apiResponse.results?.flatMap(result =>
      (result.examples || []).map(example => ({
        phrase: example,
        translation: ''
      }))
    ) || [];

    examples.forEach((example, index) => {
      const foundTranslation = uzbekData.translations
        .flatMap(t => t.examples || [])
        .find(e => e?.original === example?.phrase);

      if (foundTranslation) {
        example.translation = foundTranslation?.translated;
      }
    });

    const hasVerbDefinition = apiResponse.results?.some(
      result => result?.partOfSpeech === 'verb'
    );

    return {
      title: apiResponse.word,
      transcription: apiResponse.pronunciation?.all || '',
      definitions,
      usageFrequency: Math.round((apiResponse.frequency || 0) * 100),
      synonyms: uniqueSynonyms,
      examples,
      verbforms: hasVerbDefinition ? this.generateVerbForms(apiResponse.word) : [],
      anagrams: [] // To be implemented if needed
    };
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

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { TranslatorService } from 'src/translator/translator.service';
import { WordDetails } from './types';

@Injectable()
export class WordService {
  private readonly wordsApiURL: string;
  private readonly wordsApiKey: string;
  private readonly wordsApiHost: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly translator: TranslatorService,
  ) {
    this.wordsApiURL = this.configService.get('WORDS_API_URL');
    this.wordsApiKey = this.configService.get('WORDS_API_KEY');
    this.wordsApiHost = this.configService.get('WORDS_API_HOST');
  }

  async getWord(word: string) {
    const reqOptions = this.generateRequestOptions('GET');
    reqOptions.url = `${this.wordsApiURL}/${word}`;
    try {
      const response = await lastValueFrom(
        this.httpService.request(reqOptions),
      );
      const result: WordDetails = response.data;

      // Prepare a single string for translation
      const toTranslate = await this.translator.prepareTranslationString(result);
      // Translate the entire string at once
      const translatedString = await this.translator.translate(
        toTranslate,
        'en',
        'uz',
      );

      // Parse the translated string back into an object
      const uzbekData = this.translator.parseTranslatedString(translatedString);

      return { resultEng: result, resultUz: uzbekData };
    } catch (error) {
      console.error('Error fetching word data:', error);
      throw new Error('Failed to fetch word data');
    }
  }

  async getSynonyms(word: string): Promise<string[]> {
    const reqOptions = this.generateRequestOptions('GET');
    reqOptions.url = `${this.wordsApiURL}/${word}/synonyms`;

    try {
      const response = await lastValueFrom(
        this.httpService.request(reqOptions),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching synonyms:', error);
      throw new Error('Failed to fetch synonyms');
    }
  }

  async getFrequencyOfUse(word: string): Promise<number> {
    const reqOptions = this.generateRequestOptions('GET');
    reqOptions.url = `${this.wordsApiURL}/${word}/frequency`;

    try {
      const response = await lastValueFrom(
        this.httpService.request(reqOptions),
      );
      return response.data.frequency.perMillion;
    } catch (error) {
      console.error('Error fetching frequency:', error);
      throw new Error('Failed to fetch frequency of use');
    }
  }

  async getExamples(word: string): Promise<string[]> {
    const reqOptions = this.generateRequestOptions('GET');
    reqOptions.url = `${this.wordsApiURL}/${word}/examples`;

    try {
      const response = await lastValueFrom(
        this.httpService.request(reqOptions),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching examples:', error);
      throw new Error('Failed to fetch examples');
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

}

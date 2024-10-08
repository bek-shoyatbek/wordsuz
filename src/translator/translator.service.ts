import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { WordResponse } from 'src/word/interfaces/word-response.interface';

@Injectable()
export class TranslatorService {
  private readonly apiKey: string;
  private readonly apiHost: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('TRANSLATOR_API_KEY');
    this.apiHost = 'google-translator9.p.rapidapi.com';
    this.apiUrl = 'https://google-translator9.p.rapidapi.com/v2';
  }

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    const options = {
      method: 'POST',
      url: this.apiUrl,
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
        'Content-Type': 'application/json',
      },
      data: {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text',
      },
    };

    try {
      const response = await lastValueFrom(this.httpService.request(options));
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }
  }

  prepareTranslationString(result: WordResponse): string {
    let translationString = `${result.word || ''}\n`;
    if (result.results && Array.isArray(result.results)) {
      result.results
        .slice(0, Math.min(6, result.results.length))
        .forEach((item, index) => {
          if (item) {
            translationString += `${index}:${item.definition || ''}\n`;
            translationString += `${index}p:${item.partOfSpeech || ''}\n`;
            if (item.synonyms && Array.isArray(item.synonyms)) {
              item.synonyms
                .slice(0, Math.min(6, item.synonyms.length))
                .forEach((synonym, synIndex) => {
                  translationString += `${index}s${synIndex}:${synonym}\n`;
                });
            }
            if (item.examples && Array.isArray(item.examples)) {
              item.examples
                .slice(0, Math.min(10, item.examples.length))
                .forEach((example, exIndex) => {
                  translationString += `${index}e${exIndex}:${example}\n`;
                });
            }
          }
        });
    }
    return translationString.trim();
  }

  parseTranslatedString(translatedString: string) {
    const lines = translatedString.split('\n');
    const uzbekData: any = {
      word: lines[0],
      translations: [],
    };

    let currentTranslation: any = {};
    lines.slice(1).forEach((line) => {
      const [key, value] = line.split(':');
      if (key.length === 1) {
        if (currentTranslation.definition) {
          uzbekData.translations.push(currentTranslation);
        }
        currentTranslation = {
          definition: value,
          synonyms: [],
          examples: [],
        };
      } else if (key.endsWith('p')) {
        currentTranslation.partOfSpeech = value;
      } else if (key.includes('s')) {
        currentTranslation.synonyms.push(value);
      } else if (key.includes('e')) {
        currentTranslation.examples.push(value);
      }
    });
    if (currentTranslation.definition) {
      uzbekData.translations.push(currentTranslation);
    }

    return uzbekData;
  }
}

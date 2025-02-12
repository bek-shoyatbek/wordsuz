import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { WordApiResponse } from 'src/shared/types';

@Injectable()
export class TranslatorsService {
  private readonly logger = new Logger(TranslatorsService.name);
  private readonly apiKey: string;
  private readonly apiHost: string;
  private readonly apiUrl: string;
  private readonly maxRetries = 3;
  private readonly timeout = 10000; // 10 seconds

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
    retryCount = 0,
  ): Promise<string> {
    if (!text?.trim()) {
      return '';
    }

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
      timeout: this.timeout,
    };

    try {
      const response = await lastValueFrom(this.httpService.request(options));

      // Safer response handling
      if (response?.data?.data?.translations?.[0]?.translatedText) {
        return response.data.data.translations[0].translatedText;
      }
      throw new Error('Invalid translation response structure');

    } catch (error) {
      this.logger.error(`Translation error: ${error.message}`);

      // Retry logic
      if (retryCount < this.maxRetries) {
        this.logger.log(`Retrying translation attempt ${retryCount + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.translate(text, sourceLanguage, targetLanguage, retryCount + 1);
      }

      throw new Error(`Failed to translate text after ${this.maxRetries} attempts`);
    }
  }

  async prepareTranslationString(result: WordApiResponse): Promise<string> {
    try {
      if (!result?.results?.length) {
        throw new Error('Invalid word data structure');
      }

      const translationParts: string[] = [`${result.word || ''}`];

      const limitedResults = result.results.slice(0, 6);

      for (const [index, item] of limitedResults.entries()) {
        if (!item) continue;

        translationParts.push(`${index}:${item.definition || ''}`);
        translationParts.push(`${index}p:${item.partOfSpeech || ''}`);

        if (item.synonyms?.length) {
          const limitedSynonyms = item.synonyms.slice(0, 6);
          limitedSynonyms.forEach((synonym, synIndex) => {
            translationParts.push(`${index}s${synIndex}:${synonym}`);
          });
        }

        if (item.examples?.length) {
          const limitedExamples = item.examples.slice(0, 10);

          limitedExamples.forEach((example, exIndex) => {
            translationParts.push(`${index}e${exIndex}:${example}`);
          });

          const exampleTexts = limitedExamples.join('\n');
          try {
            const translatedExamples = await this.translate(exampleTexts, 'en', 'uz');
            const translations = translatedExamples.split('\n');

            translations.forEach((translation, exIndex) => {
              if (translation) {
                translationParts.push(`${index}et${exIndex}:${translation}`);
              }
            });
          } catch (error) {
            this.logger.error('Failed to translate examples batch:', error);
            limitedExamples.forEach((example, exIndex) => {
              translationParts.push(`${index}et${exIndex}:${example}`);
            });
          }
        }
      }

      return translationParts.join('\n').trim();
    } catch (error) {
      this.logger.error('Error preparing translation string:', error);
      throw new Error('Failed to prepare translation string');
    }
  }

  parseTranslatedString(translatedString: string) {
    if (!translatedString?.trim()) {
      return { word: '', translations: [] };
    }

    try {
      const lines = translatedString.split('\n');
      const uzbekData: any = {
        word: lines[0],
        translations: [],
      };

      let currentTranslation: any = {};
      let currentExamples: { original: string; translated: string }[] = [];

      lines.slice(1).forEach((line) => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':'); // Handle colons in translated text

        if (key.length === 1) {
          // Save previous translation if exists
          if (currentTranslation.definition) {
            if (currentExamples.length > 0) {
              currentTranslation.examples = [...currentExamples];
            }
            uzbekData.translations.push({ ...currentTranslation });
          }
          // Start new translation
          currentTranslation = {
            definition: value,
            synonyms: [],
            examples: [],
          };
          currentExamples = [];
        } else if (key.endsWith('p')) {
          currentTranslation.partOfSpeech = value;
        } else if (key.includes('s')) {
          currentTranslation.synonyms.push(value);
        } else if (key.includes('e')) {
          const exampleIndex = parseInt(key.match(/\d+/)?.[0] || '0');
          if (key.includes('et')) {
            if (!currentExamples[exampleIndex]) {
              currentExamples[exampleIndex] = { original: '', translated: '' };
            }
            currentExamples[exampleIndex].translated = value;
          } else {
            if (!currentExamples[exampleIndex]) {
              currentExamples[exampleIndex] = { original: '', translated: '' };
            }
            currentExamples[exampleIndex].original = value;
          }
        }
      });

      // Add the last translation if exists
      if (currentTranslation.definition) {
        if (currentExamples.length > 0) {
          currentTranslation.examples = [...currentExamples];
        }
        uzbekData.translations.push({ ...currentTranslation });
      }

      return uzbekData;
    } catch (error) {
      this.logger.error('Error parsing translated string:', error);
      throw new Error('Failed to parse translated string');
    }
  }
}
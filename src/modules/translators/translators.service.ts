import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { WordApiResponse } from 'src/shared/types';
import openGoogleTranslator from 'open-google-translator';

@Injectable()
export class TranslatorsService {
  private readonly logger = new Logger(TranslatorsService.name);
  private readonly apiKey: string;
  private readonly apiHost: string;
  private readonly apiUrl: string;
  private readonly maxRetries = 3;
  private readonly timeout = 10000;
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
    source?: string,
    target?: string,
    retryCount?: number,
  ) {
    openGoogleTranslator.supportedLanguages();
    const texts = [text];
    const data = await openGoogleTranslator.TranslateLanguageData({
      listOfWordsToTranslate: texts,
      fromLanguage: 'en',
      toLanguage: 'uz',
    });
    return data[0]?.translation;
  }

  async translateO(
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
      const response = await this.httpService.axiosRef.request(options);

      if (response?.data?.data?.translations?.[0]?.translatedText) {
        return response.data.data.translations[0].translatedText;
      }
      throw new Error('Invalid translation response structure');
    } catch (error) {
      console.log(error);
      this.logger.error(`Translation error: ${error.message}`);

      if (retryCount < this.maxRetries) {
        this.logger.log(`Retrying translation attempt ${retryCount + 1}...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1)),
        );
        return this.translate(
          text,
          sourceLanguage,
          targetLanguage,
          retryCount + 1,
        );
      }

      throw new Error(
        `Failed to translate text after ${this.maxRetries} attempts`,
      );
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
            const translatedExamples = await this.translate(
              exampleTexts,
              'en',
              'uz',
            );
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
          if (currentTranslation.definition) {
            if (currentExamples.length > 0) {
              currentTranslation.examples = [...currentExamples];
            }
            uzbekData.translations.push({ ...currentTranslation });
          }
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

  private async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string[]> {
    const combinedText = texts.join('\n');
    const translatedText = await this.safeTranslate(
      combinedText,
      sourceLanguage,
      targetLanguage,
    );
    return translatedText.split('\n');
  }

  private async safeTranslate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    try {
      return await this.translate(text, sourceLanguage, targetLanguage);
    } catch (error) {
      console.error(`Translation failed for text: ${text}`, error);
      return text; // Fallback to the original text
    }
  }
}

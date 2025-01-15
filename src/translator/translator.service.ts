import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { WordResponse } from 'src/word/types/word-response.interface';

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

  async prepareTranslationString(result: WordResponse): Promise<string> {
    let translationString = `${result.word || ''}\n`;
    if (result.results && Array.isArray(result.results)) {
      for (const [index, item] of result.results
        .slice(0, Math.min(6, result.results.length))
        .entries()) {
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
            for (const [exIndex, example] of item.examples
              .slice(0, Math.min(10, item.examples.length))
              .entries()) {
              // Store both original and translated examples
              translationString += `${index}e${exIndex}:${example}\n`;
              try {
                const translatedExample = await this.translate(example, 'en', 'uz');
                translationString += `${index}et${exIndex}:${translatedExample}\n`;
              } catch (error) {
                console.error(`Failed to translate example: ${example}`, error);
                translationString += `${index}et${exIndex}:${example}\n`; // Fallback to original if translation fails
              }
            }
          }
        }
      }
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
    let currentExamples: { original: string; translated: string }[] = [];

    lines.slice(1).forEach((line) => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':'); // Rejoin in case the value contains colons

      if (key.length === 1) {
        if (currentTranslation.definition) {
          if (currentExamples.length > 0) {
            currentTranslation.examples = currentExamples;
          }
          uzbekData.translations.push(currentTranslation);
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
        if (key.includes('et')) {
          // This is a translated example
          const exampleIndex = parseInt(key.match(/\d+/)[0]);
          if (!currentExamples[exampleIndex]) {
            currentExamples[exampleIndex] = { original: '', translated: '' };
          }
          currentExamples[exampleIndex].translated = value;
        } else {
          // This is an original example
          const exampleIndex = parseInt(key.match(/\d+/)[0]);
          if (!currentExamples[exampleIndex]) {
            currentExamples[exampleIndex] = { original: '', translated: '' };
          }
          currentExamples[exampleIndex].original = value;
        }
      }
    });

    // Add the last translation if it exists
    if (currentTranslation.definition) {
      if (currentExamples.length > 0) {
        currentTranslation.examples = currentExamples;
      }
      uzbekData.translations.push(currentTranslation);
    }

    return uzbekData;
  }
}
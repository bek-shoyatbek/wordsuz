import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { TranslatorsService } from '../translators/translators.service';
import { WordApiResponse } from 'src/shared/types';
import { WordDetails } from './types';
import { DatabaseService } from 'src/shared/database/database.service';

@Injectable()
export class WordsService {
  private readonly wordsApiURL: string;
  private readonly wordsApiKey: string;
  private readonly wordsApiHost: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly translator: TranslatorsService,
    private readonly database: DatabaseService,
  ) {
    this.wordsApiURL = this.configService.get('WORDS_API_URL');
    this.wordsApiKey = this.configService.get('WORDS_API_KEY');
    this.wordsApiHost = this.configService.get('WORDS_API_HOST');
  }

  async getWord(word: string) {
    const apiResponse = await this.getWordDetails(word);

    const dbWord = await this.database.word.findUnique({
      where: { titleEng: word.trim() },
      include: {
        definitions: {
          include: {
            others: {
              include: {
                examples: true,
              },
            },
          },
        },
        examples: true,
        verbForms: true,
      },
    });

    if (dbWord) {
      return dbWord;
    }

    const wordDetails = await this.transformWordResponse(apiResponse);
    wordDetails.titleEng = word;
    await this.insertWordIfNotExists(wordDetails);
    return wordDetails;
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

  async insertWordIfNotExists(wordDetails: WordDetails): Promise<void> {
    const {
      title,
      transcription,
      definitions,
      usageFrequency,
      synonyms,
      examples,
      verbforms,
      anagrams,
      titleEng,
    } = wordDetails;

    const result = await this.database.word.upsert({
      where: { titleEng: titleEng }, // Unique field to check for existing word
      update: {}, // No update needed if the word already exists
      create: {
        titleEng,
        titleUz: title,
        transcription,
        usageFrequency,
        synonyms,
        anagrams,
        definitions: {
          create: definitions.map((def) => ({
            typeEn: def.typeEn,
            typeUz: def.typeUz,
            meaning: def.meaning,
            plural: def.plural,
            others: {
              create: def.others.map((other) => ({
                meaning: other.meaning,
                examples: {
                  create: other.examples.map((example) => ({
                    phrase: example.phrase,
                    translation: example.translation,
                  })),
                },
              })),
            },
          })),
        },
        examples: {
          create: examples.map((example) => ({
            phrase: example.phrase,
            translation: example.translation,
          })),
        },
        verbForms: {
          create: verbforms.map((verbForm) => ({
            tense: verbForm.tense,
            content: verbForm.content,
          })),
        },
      },
    });

    console.log('result ', result);
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
          (defs as any)
            .slice(1)
            .map(async (def: { definition: string; examples: string[] }) => ({
              meaning: await this.translator.translate(
                def.definition,
                'en',
                'uz',
              ),
              examples: await Promise.all(
                (def.examples || []).map(async (example: string) => ({
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

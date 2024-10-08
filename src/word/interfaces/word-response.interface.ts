export interface WordResponseResult {
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
  typeOf: string[];
  examples: string[];

  hasTypes?: string[];
  verbGroup?: string[];
  derivation?: string[];
  antonyms?: string[];
}

export interface WordSyllables {
  count: number;
  list: string[];
}
export interface WordResponse {
  word: string;
  results: WordResponseResult[];
  syllables?: WordSyllables;
  pronounciation?: {
    ['key']: any;
  };
  frequency: number;
}

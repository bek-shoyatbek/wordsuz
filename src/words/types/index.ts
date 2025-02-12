export type WordDefinition = {
  typeEn: string;
  typeUz: string;
  meaning: string;
  plural: string;
  others: {
    meaning: string;
    examples: {
      phrase: string;
      translation: string;
    }[];
  }[];
}

export type Content = {
  title: string;
  forms: {
    singular: string;
    plural: string;
  }[]
}

export type VerbForm = {
  tense: string;
  content: Content[];
}

export type Example = {
  phrase: string;
  translation: string;
}

export type WordDetails = {
  title: string;
  transcription: string;
  definitions: WordDefinition[];
  usageFrequency: number;
  synonyms: string[];
  examples: Example[];
  verbforms: VerbForm[];
  anagrams: string[];
}

export type IrregularVerb = {
  baseForm: string;
  pastSimple: string;
  pastParticiple: string;
  meaning: string;
}


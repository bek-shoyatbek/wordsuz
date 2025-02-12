export interface WordApiResponse {
    word: string;
    results: Array<{
        definition: string;
        partOfSpeech: string;
        synonyms?: string[];
        examples?: string[];
        hasTypes?: string[];
    }>;
    syllables?: {
        count: number;
        list: string[];
    };
    pronunciation?: {
        all: string;
    };
    frequency?: number;
}
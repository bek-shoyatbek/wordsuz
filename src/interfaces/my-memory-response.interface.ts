export interface MyMemoryResponse {
    responseData: {
      translatedText: string;
      match: number;
    };
    quotaFinished: boolean;
    responseDetails: string;
    responseStatus: number;
    matches: Array<{
      id: string | number;
      segment: string;
      translation: string;
      quality: string | number;
      reference: string | null;
      usage_count: number;
      subject: string | boolean;
      created_by: string;
      last_updated_by: string;
      create_date: string;
      last_update_date: string;
      match: number;
    }>;
  }
  
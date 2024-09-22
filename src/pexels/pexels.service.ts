import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'pexels';

@Injectable()
export class PexelsService {
  private readonly pexelsClient;

  constructor(private configService: ConfigService) {
    const pexelsApiKey = this.configService.get('PEXELS_API_KEY');
    this.pexelsClient = createClient(pexelsApiKey);
  }

  private async searchPhotos(
    about: string,
    orientation?: string,
    size?: 'large' | 'medium' | 'small',
  ): Promise<any> {
    const response = await this.pexelsClient.photos.search({
      query: about,
      per_page: 10,
      orientation: orientation || 'portrait',
    });
    return response;
  }

  async getPhoto(
    about: string,
    orientation?: string,
    size?: 'large' | 'medium' | 'small',
  ): Promise<any> {
    const response = await this.searchPhotos(about, orientation, size);

    const photosLength = response?.photos?.length;
    if (!photosLength) {
      throw new Error('No photos found');
    }

    if (photosLength === 1) {
      return { imageUrl: response?.photos[0]?.src?.original };
    }

    const randomIndex = Math.floor(Math.random() * photosLength);
    const randomPhoto = response?.photos[randomIndex];
    return { imageUrl: randomPhoto?.src?.original };
  }
}

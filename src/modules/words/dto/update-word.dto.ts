import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';

export class UpdateWordDto {
  @IsOptional() @IsString() titleUz?: string;
  @IsOptional() @IsString() transcription?: string;
  @IsOptional() @IsInt() usageFrequency?: number;
  @IsOptional() @IsArray() synonyms?: string[];
  @IsOptional() @IsArray() anagrams?: string[];
}

import { IsOptional, IsString } from 'class-validator';

export class UpdateDefinitionDto {
  @IsOptional() @IsString() typeEn?: string;
  @IsOptional() @IsString() typeUz?: string;
  @IsOptional() @IsString() meaning?: string;
  @IsOptional() @IsString() plural?: string;
}

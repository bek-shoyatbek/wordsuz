import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDefinitionDto {
  @IsString()
  @IsNotEmpty()
  typeEn: string;

  @IsString()
  @IsNotEmpty()
  typeUz: string;

  @IsString()
  @IsNotEmpty()
  meaning: string;

  @IsOptional()
  @IsString()
  plural?: string;
}

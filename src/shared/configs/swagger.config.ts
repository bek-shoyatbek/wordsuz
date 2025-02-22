import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Words.uz')
  .setDescription('https://words.uz API docs')
  .setVersion('1.0')
  .build();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './shared/configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appPort = configService.get('APP_PORT');

  const logger = app.get(Logger);

  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory);

  logger.log(`Application is running on port ${appPort}`, 'Bootstrap');
  await app.listen(appPort ?? 3000);
}
bootstrap();

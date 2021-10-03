import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BackendValidationPipe } from './shared/pipes/backend.validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new BackendValidationPipe());
  await app.listen(7777);
}
bootstrap();

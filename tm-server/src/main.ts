import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { env } from 'process';
import { AppModule } from '//app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ credentials: true, origin: ['http://localhost:4200', 'http://localhost:8080'] });
  await app.listen(env.PORT || 8080);
}
bootstrap();

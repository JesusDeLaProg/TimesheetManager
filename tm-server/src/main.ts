import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { env } from 'process';
import { AppModule } from '//app.module';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose']
  });
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    allowedHeaders: ['Accept', 'Accept-Language', 'Content-Language', 'Content-Type', 'Range', 'Cookie'],
    origin: ['http://127.0.0.1:4200', 'http://127.0.0.1:8080', 'http://127.0.0.1'] });
  app.use(morgan('combined'));
  await app.listen(env.PORT || 8080);
}
bootstrap();

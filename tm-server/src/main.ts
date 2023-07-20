import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { env } from 'process';
import { AppModule } from '//app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await app.listen(env['tm_server_port'] || 8080);
}
bootstrap();

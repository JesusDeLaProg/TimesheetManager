import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseController } from './controllers/base/base/base.controller';
import { BaseController } from './controllers/base/base.controller';

@Module({
  imports: [],
  controllers: [AppController, BaseController],
  providers: [AppService],
})
export class AppModule {}

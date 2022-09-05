import { Module } from '@nestjs/common';
import { AppController } from '//app.controller';
import { AppService } from '//app.service';
import { CrudService } from '//services/crud/crud.service';
import { UserController } from '//controllers/user/user.controller';
import { ProjectService } from '//services/project/project.service';
import { UserService } from '//services/user/user.service';
import { ROOT_DOC } from '//config/constants';
import { root } from '//config/db';

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    CrudService,
    UserService,
    {
      provide: ROOT_DOC,
      useValue: root,
    },
    ProjectService,
  ],
})
export class AppModule {}

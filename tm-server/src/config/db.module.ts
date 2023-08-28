import { Module } from '@nestjs/common';
import { ACTIVITIES, PHASES, PROJECTS, TIMESHEETS, USERS } from './constants';
import { root } from './db';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { DocumentData, QueryDocumentSnapshot } from '@google-cloud/firestore';
import { StringId } from '//types/models/datamodels';
import { Activity } from '//dtos/activity';
import { Phase } from '//dtos/phase';
import { Project } from '//dtos/project';
import { Timesheet } from '//dtos/timesheet';
import { User } from '//dtos/user';

function documentConverter<T extends { _id?: StringId }>(
  objectClass: ClassConstructor<T>,
) {
  return {
    toFirestore(classObj: T): DocumentData {
      return instanceToPlain(classObj, { excludePrefixes: ['_'] });
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): T {
      const classObj = plainToInstance(objectClass, snapshot.data());
      classObj._id = snapshot.id;
      return classObj;
    },
  };
}

@Module({
  providers: [
    {
      provide: ACTIVITIES,
      useValue: root
        .collection('activity')
        .withConverter(documentConverter(Activity)),
    },
    {
      provide: PHASES,
      useValue: root
        .collection('phase')
        .withConverter(documentConverter(Phase)),
    },
    {
      provide: PROJECTS,
      useValue: root
        .collection('project')
        .withConverter(documentConverter(Project)),
    },
    {
      provide: TIMESHEETS,
      useValue: root
        .collection('timesheet')
        .withConverter(documentConverter(Timesheet)),
    },
    {
      provide: USERS,
      useValue: root.collection('user').withConverter(documentConverter(User)),
    },
  ],
  exports: [ACTIVITIES, PHASES, PROJECTS, TIMESHEETS, USERS],
})
export class DbModule {}

import 'reflect-metadata';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  QueryDocumentSnapshot,
} from '@google-cloud/firestore';
import { StringId, UserRole } from '@tm/types/models/datamodels';
import { User } from '//dtos/user';
import { v4 as uuidv4 } from 'uuid';
import {
  ACTIVITIES,
  PHASES,
  PROJECTS,
  TIMESHEETS,
  USERS,
} from '//config/constants';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { Activity } from '//dtos/activity';
import { Phase } from '//dtos/phase';
import { Project } from '//dtos/project';
import { Timesheet } from '//dtos/timesheet';
import { JwtModule } from '@nestjs/jwt';

jest.setTimeout(120000);

export const testUser: User = {
  _id: 'abcd',
  username: 'test-user',
  firstName: 'test',
  lastName: 'user',
  email: 'test@tm.net',
  billingGroups: [],
  isActive: true,
  role: UserRole.SUPERADMIN,
};

export function addDocumentsToCollection(
  collection: CollectionReference,
  documents: any[],
) {
  return Promise.all(
    documents.map(async (data) => {
      const doc = collection.doc();
      Object.assign(doc, data);
      await doc.set(data);
      return doc;
    }),
  );
}

export function documentConverter<T extends { _id?: StringId }>(
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

export async function initFirestore() {
  const db = new Firestore({
    projectId: 'timesheet-manager-v2',
    ignoreUndefinedProperties: true,
  });
  const uuid = uuidv4();
  const root = db.collection('timesheet-manager').doc(`test_${uuid}`);
  await db.recursiveDelete(root);
  const providers = [
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
  ];
  return { db, root, providers };
}

export async function closeFirestore({
  db,
  root,
}: {
  db: Firestore;
  root: FirebaseFirestore.DocumentReference;
}) {
  await db.recursiveDelete(root);
}

export const JwtModuleProvider = () =>
  JwtModule.register({
    secret: 'secret',
    signOptions: {
      algorithm: 'HS256',
      issuer: 'TEST',
      expiresIn: '1h',
      mutatePayload: true,
    },
  });

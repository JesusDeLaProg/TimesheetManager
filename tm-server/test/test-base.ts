import 'reflect-metadata';
import { CollectionReference, Firestore } from '@google-cloud/firestore';
import { UserRole } from '@tm/types/models/datamodels';
import { User } from '//dtos/user';
import { v4 as uuidv4 } from 'uuid';

export const testUser: User = {
  _id: 'abcd',
  username: 'test-user',
  firstName: 'test',
  lastName: 'user',
  email: 'test@tm.net',
  billingGroups: [],
  isActive: true,
  role: UserRole.ADMIN,
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

export async function initFirestore() {
  const db = new Firestore({
    projectId: 'timesheet-manager-v2',
    ignoreUndefinedProperties: true,
  });
  const uuid = uuidv4();
  const root = db.collection('timesheet-manager').doc(`test_${uuid}`);
  await db.recursiveDelete(root);
  return { db, root };
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

import { CollectionReference, Firestore } from '@google-cloud/firestore';
import { UserRole } from '@tm/types/models/datamodels';
import { User } from '//dtos/user';

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

export function initFirestore() {
  const db = new Firestore({
    projectId: 'timesheet-manager-v2',
    ignoreUndefinedProperties: true,
  });
  const root = db.collection('timesheet-manager').doc('test');
  db.recursiveDelete(root);
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

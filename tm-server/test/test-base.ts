import { Firestore } from '@google-cloud/firestore';

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

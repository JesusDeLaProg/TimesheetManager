import { Firestore } from '@google-cloud/firestore';

export const db = new Firestore({
  projectId: 'timesheet-manager-v2',
  ignoreUndefinedProperties: true,
});

export const root = db.collection('timesheet-manager').doc('prod');

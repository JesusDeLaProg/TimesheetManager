import { closeFirestore, initFirestore } from '//test/test-base';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  QueryDocumentSnapshot,
} from '@google-cloud/firestore';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ValidationResult } from '../types/validator';
import { Activity, ActivityValidator } from './activity';

describe('ActivityDTO', () => {
  let db: Firestore;
  let root: DocumentReference;
  let validator: ActivityValidator;
  let collection: CollectionReference<Activity>;

  beforeAll(async () => {
    ({ db, root } = await initFirestore());
    collection = root.collection('activity').withConverter({
      toFirestore(classObj: Activity): DocumentData {
        return instanceToPlain(classObj, { excludePrefixes: ['_'] });
      },
      fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Activity {
        const classObj = plainToInstance(Activity, snapshot.data());
        classObj._id = snapshot.id;
        return classObj;
      },
    }) as CollectionReference<Activity>;
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    validator = new ActivityValidator(collection);
  });

  afterEach(async () => {
    await db.recursiveDelete(collection);
  });

  it('is valid', () => {
    expect(
      validator.validate({ _id: '1', code: 'AB', name: 'test' }),
    ).resolves.toEqual<ValidationResult<Activity>>({
      __success: true,
      _id: '1',
      code: 'AB',
      name: 'test',
    });
  });

  it('is empty object and invalid', () => {
    expect(validator.validate({})).resolves.toMatchObject<
      ValidationResult<Activity>
    >({
      __success: false,
      errors: [
        {
          property: 'code',
          constraints: {
            isString: 'code doit être du texte',
            matches: 'code doit respecter le format /[A-Z]{2,3}[0-9]{0,2}/',
          },
        },
        {
          property: 'name',
          constraints: {
            isString: 'name doit être du texte',
            isNotEmpty: 'name ne doit pas être vide',
          },
        },
      ],
    });
  });

  it('is missing code and invalid', () => {
    expect(validator.validate({ name: 'Abcd' })).resolves.toMatchObject<
      ValidationResult<Activity>
    >({
      __success: false,
      errors: [
        {
          property: 'code',
          constraints: {
            isString: 'code doit être du texte',
            matches: 'code doit respecter le format /[A-Z]{2,3}[0-9]{0,2}/',
          },
        },
      ],
    });
  });

  it('is missing name and invalid', () => {
    expect(validator.validate({ code: 'AB' })).resolves.toMatchObject<
      ValidationResult<Activity>
    >({
      __success: false,
      errors: [
        {
          property: 'name',
          constraints: {
            isString: 'name doit être du texte',
            isNotEmpty: 'name ne doit pas être vide',
          },
        },
      ],
    });
  });

  it('has invalid code', () => {
    expect(validator.validate({ code: '1ab' })).resolves.toMatchObject<
      ValidationResult<Activity>
    >({
      __success: false,
      errors: [
        {
          property: 'code',
          constraints: {
            matches: 'code doit respecter le format /[A-Z]{2,3}[0-9]{0,2}/',
          },
        },
        {
          property: 'name',
          constraints: {
            isString: 'name doit être du texte',
            isNotEmpty: 'name ne doit pas être vide',
          },
        },
      ],
    });
  });
});

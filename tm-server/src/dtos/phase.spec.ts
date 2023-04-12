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
import { Phase, PhaseValidator } from './phase';

describe('PhaseDTO', () => {
  let db: Firestore;
  let root: DocumentReference;
  let validator: PhaseValidator;
  let collection: CollectionReference<Phase>;

  beforeAll(async () => {
    ({ db, root } = await initFirestore());
    collection = root.collection('phase').withConverter({
      toFirestore(classObj: Phase): DocumentData {
        return instanceToPlain(classObj, { excludePrefixes: ['_'] });
      },
      fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Phase {
        const classObj = plainToInstance(Phase, snapshot.data());
        classObj._id = snapshot.id;
        return classObj;
      },
    }) as CollectionReference<Phase>;
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    validator = new PhaseValidator(collection);
  });

  afterEach(async () => {
    await db.recursiveDelete(collection);
  });

  it('is valid', () => {
    expect(
      validator.validate({
        _id: '1',
        code: 'AB',
        name: 'test',
        activities: ['2', '3'],
      }),
    ).resolves.toEqual<ValidationResult<Phase>>({
      __success: true,
      _id: '1',
      code: 'AB',
      name: 'test',
      activities: ['2', '3'],
    });
  });

  it('is empty object and invalid', () => {
    expect(validator.validate({})).resolves.toMatchObject<
      ValidationResult<Phase>
    >({
      __success: false,
      errors: [
        {
          property: 'code',
          constraints: {
            isString: 'code doit être du texte',
            matches: 'code doit respecter le format /[A-Z]{2,3}/',
          },
        },
        {
          property: 'name',
          constraints: {
            isString: 'name doit être du texte',
            isNotEmpty: 'name ne doit pas être vide',
          },
        },
        {
          property: 'activities',
          constraints: {
            isString: 'activities doit être du texte',
            isNotEmpty: 'activities ne doit pas être vide',
          },
        },
      ],
    });
  });

  it('is missing code and invalid', () => {
    expect(
      validator.validate({ name: 'Abcd', activities: ['2', '3'] }),
    ).resolves.toMatchObject<ValidationResult<Phase>>({
      __success: false,
      errors: [
        {
          property: 'code',
          constraints: {
            isString: 'code doit être du texte',
            matches: 'code doit respecter le format /[A-Z]{2,3}/',
          },
        },
      ],
    });
  });

  it('is missing name and invalid', () => {
    expect(
      validator.validate({ code: 'AB', activities: ['2', '3'] }),
    ).resolves.toMatchObject<ValidationResult<Phase>>({
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
      ValidationResult<Phase>
    >({
      __success: false,
      errors: [
        {
          property: 'code',
          constraints: {
            matches: 'code doit respecter le format /[A-Z]{2,3}/',
          },
        },
        {
          property: 'name',
          constraints: {
            isString: 'name doit être du texte',
            isNotEmpty: 'name ne doit pas être vide',
          },
        },
        {
          property: 'activities',
          constraints: {
            isString: 'activities doit être du texte',
            isNotEmpty: 'activities ne doit pas être vide',
          },
        },
      ],
    });
  });

  it('has string activities and invalid', () => {
    expect(
      validator.validate({ code: 'AB', name: 'test', activities: '2' }),
    ).resolves.toMatchObject<ValidationResult<Phase>>({
      __success: false,
      errors: [
        {
          property: 'activities',
          constraints: { isArray: 'activities doit être une liste' },
        },
      ],
    });
  });
});

import { closeFirestore, initFirestore } from '//test/test-base';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';
import { ValidationResult } from '//types/validator';
import { Phase, PhaseValidator } from './phase';
import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Activity } from './activity';
import { ACTIVITIES } from '//config/constants';

describe('PhaseDTO', () => {
  let db: Firestore;
  let root: DocumentReference;
  let validator: PhaseValidator;
  let providers: Provider[];
  let activities: CollectionReference<Activity>;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhaseValidator, ...providers],
    }).compile();

    validator = module.get<PhaseValidator>(PhaseValidator);
    activities = module.get<CollectionReference<Activity>>(ACTIVITIES);
    await db.recursiveDelete(root);
  });

  it('is valid Phase', async () => {
    await db.batch()
      .create(activities.doc('2'), { code: 'CD', name: 'Act 1' })
      .create(activities.doc('3'), { code: 'EF', name: 'Act 2' })
      .commit();
    await expect(
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

  it('contains invalid Activity', async () => {
    await expect(
      validator.validate({
        _id: '1',
        code: 'AB',
        name: 'test',
        activities: ['2', '3'],
      }),
    ).resolves.toMatchObject<ValidationResult<Phase>>({
      __success: false,
      errors: [
        {
          property: 'activities',
          children: [
            {
              property: '0',
              constraints: {
                isForeignKey:
                  'activities doit faire référence à un objet existant dans la collection activity',
              },
            },
            {
              property: '1',
              constraints: {
                isForeignKey:
                  'activities doit faire référence à un objet existant dans la collection activity',
              },
            },
          ],
        },
      ],
    });
  });

  it('is empty object and invalid', async () => {
    await expect(validator.validate({})).resolves.toMatchObject<
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

  it('is missing code and invalid', async () => {
    await expect(
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

  it('is missing name and invalid', async () => {
    await expect(
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

  it('has invalid code', async () => {
    await expect(validator.validate({ code: '1ab' })).resolves.toMatchObject<
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

  it('has string activities and invalid', async () => {
    await expect(
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

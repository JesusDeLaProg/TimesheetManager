import { closeFirestore, initFirestore } from '//test/test-base';
import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { ValidationResult } from '//types/validator';
import { Activity, ActivityValidator } from './activity';
import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('ActivityDTO', () => {
  let db: Firestore;
  let root: DocumentReference;
  let validator: ActivityValidator;
  let providers: Provider[];

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityValidator, ...providers],
    }).compile();

    validator = module.get<ActivityValidator>(ActivityValidator);
    await db.recursiveDelete(root);
  });

  it('is valid', async () => {
    await expect(
      validator.validate({ _id: '1', code: 'AB', name: 'test' }),
    ).resolves.toEqual<ValidationResult<Activity>>({
      __success: true,
      _id: '1',
      code: 'AB',
      name: 'test',
    });
  });

  it('is empty object and invalid', async () => {
    await expect(validator.validate({})).resolves.toMatchObject<
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

  it('is missing code and invalid', async () => {
    await expect(validator.validate({ name: 'Abcd' })).resolves.toMatchObject<
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

  it('is missing name and invalid', async () => {
    await expect(validator.validate({ code: 'AB' })).resolves.toMatchObject<
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

  it('has invalid code', async () => {
    await expect(validator.validate({ code: '1ab' })).resolves.toMatchObject<
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

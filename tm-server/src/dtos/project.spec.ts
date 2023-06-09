import { closeFirestore, initFirestore } from '//test/test-base';
import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { ProjectType } from '@tm/types/models/datamodels';
import { ValidationResult } from '//types/validator';
import { Project, ProjectValidator } from './project';
import { Test, TestingModule } from '@nestjs/testing';
import { Provider } from '@nestjs/common';

describe('ProjectDTO', () => {
  let db: Firestore;
  let root: DocumentReference;
  let validator: ProjectValidator;
  let providers: Provider[];

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectValidator, ...providers],
    }).compile();

    validator = module.get<ProjectValidator>(ProjectValidator);
    await db.recursiveDelete(root);
  });

  it('is valid', async () => {
    await expect(
      validator.validate({
        _id: '1',
        code: '23-01',
        name: 'test',
        client: 'Client 1',
        type: ProjectType.PUBLIC,
        isActive: true,
      }),
    ).resolves.toEqual<ValidationResult<Project>>({
      __success: true,
      _id: '1',
      code: '23-01',
      name: 'test',
      client: 'Client 1',
      type: ProjectType.PUBLIC,
      isActive: true,
    });
  });

  it('is empty object and invalid', async () => {
    await expect(validator.validate({})).resolves.toMatchObject<
      ValidationResult<Project>
    >({
      __success: false,
      errors: [
        {
          property: 'code',
          constraints: {
            isString: 'code doit être du texte',
            matches: 'code doit respecter le format /[0-9]{2}-[0-9]{1,3}/',
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
          property: 'client',
          constraints: {
            isString: 'client doit être du texte',
            isNotEmpty: 'client ne doit pas être vide',
          },
        },
        {
          property: 'type',
          constraints: {
            isEnum: 'type doit être une de ces valeurs: Privé, Public',
          },
        },
        {
          property: 'isActive',
          constraints: { isBoolean: 'isActive doit être vrai ou faux' },
        },
      ],
    });
  });

  it('is missing code and invalid', async () => {
    await expect(
      validator.validate({
        name: 'Projet 1',
        client: 'Client 1',
        type: ProjectType.PUBLIC,
        isActive: true,
      }),
    ).resolves.toMatchObject<ValidationResult<Project>>({
      __success: false,
      errors: [
        {
          property: 'code',
          constraints: {
            isString: 'code doit être du texte',
            matches: 'code doit respecter le format /[0-9]{2}-[0-9]{1,3}/',
          },
        },
      ],
    });
  });

  it('is missing name and invalid', async () => {
    await expect(
      validator.validate({
        code: '23-01',
        client: 'Client 1',
        type: ProjectType.PUBLIC,
        isActive: true,
      }),
    ).resolves.toMatchObject<ValidationResult<Project>>({
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
    await expect(
      validator.validate({
        code: 'ABC',
        name: 'Projet 1',
        client: 'Client 1',
        type: ProjectType.PUBLIC,
        isActive: true,
      }),
    ).resolves.toMatchObject<ValidationResult<Project>>({
      __success: false,
      errors: [
        {
          property: 'code',
          constraints: {
            matches: 'code doit respecter le format /[0-9]{2}-[0-9]{1,3}/',
          },
        },
      ],
    });
  });
});

import { closeFirestore, initFirestore } from "//test/test-base";
import { CollectionReference, DocumentData, DocumentReference, Firestore, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { IUser, ProjectType, UserRole } from "@tm/types/models/datamodels";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { ValidationResult } from "../types/validator";
import { User, UserValidator } from "./user";

const VALID_INPUT_USER: IUser = {
  _id: '1',
  username: 'johnd',
  firstName: 'John',
  lastName: 'Doe',
  email: 'johndoe@gmail.com',
  isActive: true,
  role: UserRole.ADMIN,
  billingGroups: [
    {
      projectType: ProjectType.PUBLIC,
      timeline: [
        { begin: new Date(0), end: new Date(2023, 2, 23), jobTitle: 'Ingénieur', rate: 150 },
        { begin: new Date(2023, 2, 24), jobTitle: 'Ingénieur', rate: 175 }
      ]
    },
    {
      projectType: ProjectType.PRIVE,
      timeline: [
        { begin: new Date(0), jobTitle: 'Ingénieur', rate: 200 }
      ]
    }
  ]
};

const VALID_NORMALIZED_USER: IUser = {
  _id: '1',
  username: 'johnd',
  firstName: 'John',
  lastName: 'Doe',
  email: 'johndoe@gmail.com',
  isActive: true,
  role: UserRole.ADMIN,
  billingGroups: [
    {
      projectType: ProjectType.PUBLIC,
      timeline: [
        { begin: new Date(0), end: new Date(2023, 2, 23, 23, 59, 59, 999), jobTitle: 'Ingénieur', rate: 150 },
        { begin: new Date(2023, 2, 24), jobTitle: 'Ingénieur', rate: 175 }
      ]
    },
    {
      projectType: ProjectType.PRIVE,
      timeline: [
        { begin: new Date(0), jobTitle: 'Ingénieur', rate: 200 }
      ]
    }
  ]
};

describe('UserDTO', () => {
    let db: Firestore;
    let root: DocumentReference;
    let validator: UserValidator;
    let collection: CollectionReference<User>;
  
    beforeAll(async () => {
      ({ db, root } = await initFirestore());
      collection = root.collection('user').withConverter({
        toFirestore(classObj: User): DocumentData {
          return instanceToPlain(classObj, { excludePrefixes: ['_'] });
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): User {
          const classObj = plainToInstance(User, snapshot.data());
          classObj._id = snapshot.id;
          return classObj;
        },
      }) as CollectionReference<User>;
    });
  
    afterAll(async () => {
      await closeFirestore({ db, root });
    });
  
    beforeEach(async () => {
      validator = new UserValidator(collection);
    });
  
    afterEach(async () => {
      await db.recursiveDelete(collection);
    });

    it('is valid', () => {
      expect(validator.validate(VALID_INPUT_USER)).resolves.toEqual<ValidationResult<User>>({
        __success: true,
        ...VALID_NORMALIZED_USER,
      });
    });
  
    it('is empty object and invalid', () => {
      expect(validator.validate({})).resolves.toMatchObject<ValidationResult<User>>({
        __success: false,
        errors: [
          { property: 'username', constraints: { isString: 'username doit être du texte', isNotEmpty: 'username ne doit pas être vide' } },
          { property: 'firstName', constraints: { isString: 'firstName doit être du texte', isNotEmpty: 'firstName ne doit pas être vide' } },
          { property: 'lastName', constraints: { isString: 'lastName doit être du texte', isNotEmpty: 'lastName ne doit pas être vide' } },
          { property: 'role', constraints: { isEnum: 'role doit être une de ces valeurs: 1, 2, 4, 8' } },
          { property: 'email', constraints: { isEmail: 'email doit être adresse courriel', isString: 'email doit être du texte' } },
          { property: 'password', constraints: { isString: 'password doit être du texte', isNotEmpty: 'password ne doit pas être vide' } },
          { property: 'billingGroups', constraints: { arrayMaxSize: 'Il doit y avoir 2 groupes de facturations', arrayMinSize: 'Il doit y avoir 2 groupes de facturations', arrayUnique: 'Il doit y avoir une liste de taux pour chaque type de facturation', isArray: 'billingGroups doit être une liste' } },
          { property: 'isActive', constraints: { isBoolean: 'isActive doit être vrai ou faux' } }
        ]
      });
    });

    it('has missing billing group', () => {
      expect(validator.validate({
        ...VALID_INPUT_USER,
        billingGroups: [
          {
            projectType: ProjectType.PRIVE,
            timeline: [{ begin: new Date(0), jobTitle: 'Ingénieur', rate: 150 }]
          }
        ]
      })).resolves.toMatchObject<ValidationResult<User>>({
        __success: false,
        errors: [
          { property: 'billingGroups', constraints: { arrayMinSize: 'Il doit y avoir 2 groupes de facturations' } }
        ]
      });
    });
  
    it('has has misaligned billing groups', () => {
      expect(validator.validate({
        ...VALID_INPUT_USER,
        billingGroups: [
          {
            projectType: ProjectType.PRIVE,
            timeline: [{ begin: new Date(1999, 0, 1), jobTitle: 'Ingénieur', rate: 150}]
          },
          {
            projectType: ProjectType.PUBLIC,
            timeline: [
              { begin: new Date(0), end: new Date(2023, 2, 23), jobTitle: 'Ingénieur', rate: 200 },
              { begin: new Date(2023, 2, 23), jobTitle: 'Ingénieur', rate: 225 }
            ]
          }
        ]
      })).resolves.toMatchObject<ValidationResult<User>>({
        __success: false,
        errors: [
          { property: 'billingGroups', children: [{ property: '0', children: [{ property: 'timeline', constraints: { timelineBounds: 'Le premier intervale doit commencer le 1er Janvier 1970 et le dernier intervale doit être sans fin' } }] }, { property: '1', children: [{ property: 'timeline', constraints: { timelineCompleteness: 'Les intervales doivent se suivre sans espaces et sans chevauchements' } }] }] }
        ]
      });
    });

    it('has unknown project type in billing group', () => {
      expect(validator.validate({
        ...VALID_INPUT_USER,
        billingGroups: [
          {
            projectType: ProjectType.PRIVE,
            timeline: [{ begin: new Date(0), jobTitle: 'Ingénieur', rate: 200 }]
          },
          {
            projectType: 'UNKNOWN',
            timeline: [{ begin: new Date(0), jobTitle: 'Ingénieur', rate: 150 }]
          }
        ]
      })).resolves.toMatchObject<ValidationResult<User>>({
        __success: false,
        errors: [
          { property: 'billingGroups', children: [{ property: '1', children: [{ property: 'projectType', constraints: { isEnum: 'projectType doit être une de ces valeurs: Privé, Public' } }] }] }
        ]
      });
    });

    it('is missing a password for new user', () => {
      expect(validator.validate({
        ...VALID_INPUT_USER,
        _id: undefined
      })).resolves.toMatchObject<ValidationResult<User>>({
        __success: false,
        errors: [
          { property: 'password', constraints: { isString: 'password doit être du texte', isNotEmpty: 'password ne doit pas être vide' } }
        ]
      });
    });
  });
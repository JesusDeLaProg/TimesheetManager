import { closeFirestore, initFirestore } from "//test/test-base";
import { CollectionReference, DocumentData, DocumentReference, Firestore, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { ProjectType } from "@tm/types/models/datamodels";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { ValidationResult } from "../types/validator";
import { Project, ProjectValidator } from "./project";

describe('ProjectDTO', () => {
    let db: Firestore;
    let root: DocumentReference;
    let validator: ProjectValidator;
    let collection: CollectionReference<Project>;
  
    beforeAll(async () => {
      ({ db, root } = await initFirestore());
      collection = root.collection('project').withConverter({
        toFirestore(classObj: Project): DocumentData {
          return instanceToPlain(classObj, { excludePrefixes: ['_'] });
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Project {
          const classObj = plainToInstance(Project, snapshot.data());
          classObj._id = snapshot.id;
          return classObj;
        },
      }) as CollectionReference<Project>;
    });
  
    afterAll(async () => {
      await closeFirestore({ db, root });
    });
  
    beforeEach(async () => {
      validator = new ProjectValidator(collection);
    });
  
    afterEach(async () => {
      await db.recursiveDelete(collection);
    });

    it('is valid', () => {
      expect(validator.validate({
        _id: '1', code: '23-01', name: 'test', client: '2', type: ProjectType.PUBLIC, isActive: true
      })).resolves.toEqual<ValidationResult<Project>>({
        __success: true,
        _id: '1',
        code: '23-01',
        name: 'test',
        client: '2',
        type: ProjectType.PUBLIC,
        isActive: true
      });
    });
  
    it('is empty object and invalid', () => {
      expect(validator.validate({})).resolves.toMatchObject<ValidationResult<Project>>({
        __success: false,
        errors: [
          { property: 'code', constraints: { isString: 'code doit être du texte', matches: 'code doit respecter le format /[0-9]{2}-[0-9]{1,3}/' } },
          { property: 'name', constraints: { isString: 'name doit être du texte', isNotEmpty: 'name ne doit pas être vide' } },
          { property: 'client', constraints: { isString: 'client doit être du texte', isNotEmpty: 'client ne doit pas être vide' } },
          { property: 'type', constraints: { isEnum: 'type doit être une de ces valeurs: Privé, Public' } },
          { property: 'isActive', constraints: { isBoolean: 'isActive doit être vrai ou faux' } },
        ]
      })
    });
  
    it('is missing code and invalid', () => {
      expect(validator.validate({
        name: 'Projet 1',
        client: '1',
        type: ProjectType.PUBLIC,
        isActive: true
      })).resolves.toMatchObject<ValidationResult<Project>>({
        __success: false,
        errors: [
          { property: 'code', constraints: { isString: 'code doit être du texte', matches: 'code doit respecter le format /[0-9]{2}-[0-9]{1,3}/' } },
        ]
      })
    });
  
    it('is missing name and invalid', () => {
      expect(validator.validate({
        code: '23-01',
        client: '1',
        type: ProjectType.PUBLIC,
        isActive: true
      })).resolves.toMatchObject<ValidationResult<Project>>({
        __success: false,
        errors: [
          { property: 'name', constraints: { isString: 'name doit être du texte', isNotEmpty: 'name ne doit pas être vide' } }
        ]
      })
    });

    it('has invalid code', () => {
      expect(validator.validate({
        code: 'ABC',
        name: 'Projet 1',
        client: '1',
        type: ProjectType.PUBLIC,
        isActive: true
      })).resolves.toMatchObject<ValidationResult<Project>>({
        __success: false,
        errors: [
          { property: 'code', constraints: { matches: 'code doit respecter le format /[0-9]{2}-[0-9]{1,3}/' } }
        ]
      })
    });
  });
import { CollectionReference, Firestore, Query } from '@google-cloud/firestore';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  initFirestore,
  closeFirestore,
  addDocumentsToCollection,
  documentConverter,
} from '//test/test-base';
import { CrudService } from './crud.service';
import { IUser, UserRole } from '@tm/types/models/datamodels';
import { BaseObjectValidator } from '//utils/validation';

class Data {
  @IsString({})
  @IsOptional()
  _id?: string;

  @IsNumber(
    {},
    {
      message: (valArgs) => `data doit être un nombre. data: ${valArgs.value}`,
    },
  )
  data: number;
}

class DataValidator extends BaseObjectValidator<Data> {
  constructor(datas: CollectionReference<Data>) {
    super(datas, Data);
  }
}

class AllAuthorizedCrudService<T> extends CrudService<T> {
  protected async authorizeCreate(
    user: IUser,
    updatedDocument: T,
  ): Promise<boolean> {
    return true;
  }
  protected async authorizeDelete(
    user: IUser,
    originalDocument: T,
  ): Promise<boolean> {
    return true;
  }
  protected async authorizeRead(
    user: IUser,
    originalDocumentOrQuery: T,
  ): Promise<boolean>;
  protected async authorizeRead(
    user: IUser,
    originalDocumentOrQuery: Query<T>,
  ): Promise<Query<T>>;
  protected async authorizeRead(
    user: IUser,
    originalDocumentOrQuery: T | Query<T>,
  ): Promise<boolean | Query<T>> {
    if (originalDocumentOrQuery instanceof Query) {
      return originalDocumentOrQuery;
    } else {
      return true;
    }
  }
  protected async authorizeUpdate(
    user: IUser,
    originalDocument: T,
    updatedDocument: T,
  ): Promise<boolean> {
    return true;
  }
}

const dummyUser: IUser = {
  _id: '0',
  billingGroups: [],
  email: 'admin@tm.com',
  firstName: 'admin',
  lastName: 'admin',
  isActive: true,
  role: UserRole.ADMIN,
  username: 'admin',
  password: '123456',
};

describe('CrudService', () => {
  let service: CrudService<Data>;
  let db: Firestore;
  let root: FirebaseFirestore.DocumentReference;
  let collection: CollectionReference<Data>;

  beforeAll(async () => {
    ({ db, root } = await initFirestore());
    collection = root
      .collection('base')
      .withConverter(documentConverter(Data)) as CollectionReference<Data>;
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    service = new AllAuthorizedCrudService<Data>(
      collection,
      Data,
      new DataValidator(collection),
    );
    await db.recursiveDelete(root);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('get() returns all items', async () => {
    await addDocumentsToCollection(collection, [
      { data: 1 },
      { data: 2 },
      { data: 3 },
    ]);
    expect(await service.get(dummyUser)).toEqual(
      expect.arrayContaining([
        { _id: expect.any(String), data: 1 },
        { _id: expect.any(String), data: 2 },
        { _id: expect.any(String), data: 3 },
      ]),
    );
  });

  it('get(queryOptions) returns only requested items', async () => {
    await addDocumentsToCollection(collection, [
      { data: 1 },
      { data: 2 },
      { data: 3 },
      { data: 4 },
      { data: 5 },
    ]);
    expect(
      await service.get(dummyUser, {
        sort: [{ field: 'data', direction: 'desc' }],
        skip: 2,
        limit: 2,
      }),
    ).toEqual(
      expect.arrayContaining([
        { _id: expect.any(String), data: 3 },
        { _id: expect.any(String), data: 2 },
      ]),
    );
  });

  it('count() returns total number of documents in collection', async () => {
    await addDocumentsToCollection(collection, [
      { data: 1 },
      { data: 2 },
      { data: 3 },
      { data: 4 },
      { data: 5 },
    ]);
    expect(await service.count(dummyUser)).toEqual(5);
  });

  it('getById() returns total number of documents in collection', async () => {
    const docs = await addDocumentsToCollection(collection, [
      { data: 1 },
      { data: 2 },
      { data: 3 },
      { data: 4 },
      { data: 5 },
    ]);
    expect(await service.getById(dummyUser, docs[2].id)).toEqual({
      _id: docs[2].id,
      data: 3,
    });
  });

  it('validate(valid) should return input object', async () => {
    expect(await service.validate({ data: 1 })).toEqual({
      value: { data: 1 },
      __success: true,
    });
  });

  it('validate(invalid) should return validation errors', async () => {
    expect(await service.validate({ data: 'test' })).toMatchObject({
      __success: false,
      errors: [
        {
          value: 'test',
          constraints: { isNumber: 'data doit être un nombre. data: test' },
        },
      ],
    });
  });

  it('create(valid) should return created doc', async () => {
    expect(await service.create(dummyUser, { data: 1 })).toEqual({
      value: { _id: expect.any(String), data: 1 },
      __success: true,
    });
  });

  it('create(invalid) should return validation errors', async () => {
    expect(await service.create(dummyUser, { data: 'test' })).toMatchObject({
      __success: false,
      errors: [
        {
          value: 'test',
          constraints: { isNumber: 'data doit être un nombre. data: test' },
        },
      ],
    });
  });

  it('update(valid) should return updated doc', async () => {
    const docs = await addDocumentsToCollection(collection, [{ data: 1 }]);

    expect(
      await service.update(dummyUser, { _id: docs[0].id, data: 10 }),
    ).toEqual({
      value: { _id: docs[0].id, data: 10 },
      __success: true,
    });
  });

  it('update(invalid) should return validation errors', async () => {
    const docs = await addDocumentsToCollection(collection, [{ data: 1 }]);
    expect(
      await service.update(dummyUser, { _id: docs[0].id, data: 'test' }),
    ).toMatchObject({
      __success: false,
      errors: [
        {
          value: 'test',
          constraints: { isNumber: 'data doit être un nombre. data: test' },
        },
      ],
    });
  });

  it('delete(id) should delete doc', async () => {
    const docs = await addDocumentsToCollection(collection, [{ data: 1 }]);
    expect(await service.delete(dummyUser, docs[0].id)).toEqual(true);
    expect(await collection.listDocuments()).toHaveLength(0);
  });

  it('searchByField(field, value) should return requested docs', async () => {
    const docs = await addDocumentsToCollection(collection, [
      { data: 1 },
      { data: 2 },
      { data: 3 },
      { data: 4 },
      { data: 5 },
    ]);
    expect(await service.searchByField(dummyUser, 'data', 3)).toEqual([
      { _id: expect.any(String), data: 3 },
    ]);
  });

  it('prefixSearchByField(field, prefix) should delete doc', async () => {
    const docs = await addDocumentsToCollection(collection, [
      { data: '1' },
      { data: '2' },
      { data: '3' },
      { data: '4' },
      { data: '5' },
      { data: '6' },
      { data: '7' },
      { data: '8' },
      { data: '9' },
      { data: '10' },
      { data: '100' },
      { data: '1000' },
    ]);
    expect(await service.prefixSearchByField(dummyUser, 'data', '1')).toEqual(
      expect.arrayContaining([
        { _id: expect.any(String), data: '1' },
        { _id: expect.any(String), data: '10' },
        { _id: expect.any(String), data: '100' },
        { _id: expect.any(String), data: '1000' },
      ]),
    );
  });
});

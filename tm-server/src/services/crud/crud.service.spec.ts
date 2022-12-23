import { CollectionReference, Firestore, Query } from '@google-cloud/firestore';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  initFirestore,
  closeFirestore,
  addDocumentsToCollection,
} from '//test/test-base';
import { CrudService } from './crud.service';
import { IUser, UserRole } from '@tm/types/models/datamodels';

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
    ({ db, root } = initFirestore());
    collection = root.collection('base') as CollectionReference<Data>;
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    service = new AllAuthorizedCrudService<Data>(collection, Data);
  });
  afterEach(async () => {
    await db.recursiveDelete(collection);
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

  it('validate(valid) should return empty array', async () => {
    expect(await service.validate({ data: 1 }, true)).toEqual({
      __success: true,
    });
  });

  it('validate(invalid) should return validation errors', async () => {
    expect(await service.validate({ data: 'test' }, true)).toEqual({
      data: ['data doit être un nombre. data: test'],
      __success: false,
    });
  });

  it('create(valid) should return created doc', async () => {
    expect(await service.create(dummyUser, { data: 1 })).toEqual({
      _id: expect.any(String),
      data: 1,
      __success: true,
    });
  });

  it('create(invalid) should return validation errors', async () => {
    expect(await service.create(dummyUser, { data: 'test' })).toEqual({
      data: ['data doit être un nombre. data: test'],
      __success: false,
    });
  });

  it('update(valid) should return updated doc', async () => {
    const docs = await addDocumentsToCollection(collection, [{ data: 1 }]);
    expect(await service.update(dummyUser, docs[0].id, { data: 10 })).toEqual({
      _id: docs[0].id,
      data: 10,
      __success: true,
    });
  });

  it('update(invalid) should return validation errors', async () => {
    const docs = await addDocumentsToCollection(collection, [{ data: 1 }]);
    expect(
      await service.update(dummyUser, docs[0].id, { data: 'test' }),
    ).toEqual({
      data: ['data doit être un nombre. data: test'],
      __success: false,
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
    ]);
    expect(await service.prefixSearchByField(dummyUser, 'data', '1')).toEqual(
      expect.arrayContaining([
        { _id: expect.any(String), data: '1' },
        { _id: expect.any(String), data: '10' },
      ]),
    );
  });
});

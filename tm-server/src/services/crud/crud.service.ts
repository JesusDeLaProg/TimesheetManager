import {
  CollectionReference,
  DocumentData,
  FirestoreDataConverter,
  Query,
  QueryDocumentSnapshot,
} from '@google-cloud/firestore';
import { StringId } from '@tm/types/models/datamodels';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { QueryOptions } from '//dtos/query_options';
import { User } from '//dtos/user';
import { Status } from '//types/status';
import {
  ObjectValidator,
  ObjectValidatorConstructor,
  ValidationResult,
} from '//types/validator';

export type MutationResult<T> = ValidationResult<T>;
export class CrudService<T extends { _id?: StringId }> {
  private documentConverter: FirestoreDataConverter<T>;
  private objectValidator: ObjectValidator<T>;
  protected collection: CollectionReference<T>;

  constructor(
    collection: CollectionReference<T>,
    private objectClass: ClassConstructor<T>,
    ObjectValidatorClass: ObjectValidatorConstructor<T>,
  ) {
    this.documentConverter = {
      toFirestore(classObj: T): DocumentData {
        return instanceToPlain(classObj, { excludePrefixes: ['_'] });
      },
      fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): T {
        const classObj = plainToInstance(objectClass, snapshot.data());
        classObj._id = snapshot.id;
        return classObj;
      },
    };
    this.collection = collection.withConverter(this.documentConverter);
    this.objectValidator = new ObjectValidatorClass(
      this.collection,
      objectClass,
    );
  }

  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: T,
  ): Promise<boolean>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<T>,
  ): Promise<Query<T> | null>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: T | Query<T>,
  ): Promise<boolean | Query<T> | null> {
    if (originalDocumentOrQuery instanceof Query) {
      return null;
    } else {
      return false;
    }
  }

  protected async authorizeCreate(
    user: User,
    updatedDocument: T,
  ): Promise<boolean> {
    return false;
  }

  protected async authorizeUpdate(
    user: User,
    originalDocument: T,
    updatedDocument: T,
  ): Promise<boolean> {
    return false;
  }
  protected async authorizeDelete(
    user: User,
    originalDocument: T,
  ): Promise<boolean> {
    return false;
  }

  private applyQueryOptions(query: Query<T>, queryOptions?: QueryOptions) {
    if (queryOptions) {
      if (queryOptions.sort) {
        for (const sortOpt of queryOptions.sort) {
          query = query.orderBy(sortOpt.field, sortOpt.direction);
        }
      }
      if (queryOptions.skip) {
        query = query.offset(queryOptions.skip);
      }
      if (queryOptions.limit) {
        query = query.limit(queryOptions.limit);
      }
    }
    return query;
  }

  async getById(user: User, id: string): Promise<T | null> {
    const result = (await this.collection.doc(id).get()).data();
    if (await this.authorizeRead(user, result)) {
      return result || null;
    }
    throw new Status(403, `Lecture refusée sur document ${id}`);
  }

  async get(user: User, queryOptions?: QueryOptions): Promise<T[]> {
    const prefilteredQuery = await this.authorizeRead(user, this.collection);
    if (!prefilteredQuery)
      throw new Status(
        403,
        `Lecture refusée sur ressource ${this.collection.path}`,
      );
    return (
      await this.applyQueryOptions(prefilteredQuery, queryOptions).get()
    ).docs.map((doc) => doc.data());
  }

  async count(user: User): Promise<number> {
    const prefilteredQuery = await this.authorizeRead(user, this.collection);
    if (!prefilteredQuery)
      throw new Status(
        403,
        `Lecture refusée sur ressource ${this.collection.path}`,
      );
    return (await prefilteredQuery.select().get()).size;
  }

  async validate(object: any): Promise<ValidationResult<T>> {
    return this.objectValidator.validate(object);
  }

  async create(user: User, object: any): Promise<MutationResult<T>> {
    delete object._id;
    const validationResult = await this.validate(object);
    if (!validationResult.__success) {
      return validationResult;
    } else {
      delete validationResult.__success;
      if (await this.authorizeCreate(user, object)) {
        return Object.assign(
          { __success: true as const },
          (
            await (await this.collection.add(validationResult as T)).get()
          ).data(),
        );
      } else {
        throw new Status(
          403,
          `Création refusée sur ressource ${this.collection.path}`,
        );
      }
    }
  }

  async update(
    user: User,
    id: string,
    object: any,
  ): Promise<MutationResult<T>> {
    const validationResult = await this.validate(object);
    if (!validationResult.__success) {
      return validationResult;
    } else {
      const originalDocument = await this.getById(user, id);
      const updatedDocument = plainToInstance(this.objectClass, object);
      if (await this.authorizeUpdate(user, originalDocument, updatedDocument)) {
        const docRef = this.collection.doc(id);
        await docRef.set(updatedDocument);
        return Object.assign(
          { __success: true as const },
          (await docRef.get()).data(),
        );
      } else {
        throw new Status(403, `Mise à jour refusée sur document ${id}`);
      }
    }
  }

  async delete(user: User, id: string): Promise<boolean> {
    const originalDocument = await this.getById(user, id);
    if (await this.authorizeDelete(user, originalDocument)) {
      await this.collection.doc(id).delete();
      return true;
    }
    throw new Status(403, `Suppression refusée sur document ${id}`);
  }

  async searchByField(
    user: User,
    field: string,
    value: any,
    queryOptions?: QueryOptions,
  ): Promise<T[]> {
    const prefilteredQuery = await this.authorizeRead(user, this.collection);
    if (!prefilteredQuery)
      throw new Status(
        403,
        `Lecture refusée sur ressource ${this.collection.path}`,
      );
    return (
      await this.applyQueryOptions(
        prefilteredQuery.where(field, '==', value),
        queryOptions,
      ).get()
    ).docs.map((doc) => doc.data());
  }

  async prefixSearchByField(
    user: User,
    field: string,
    prefix: string,
    queryOptions?: QueryOptions,
  ): Promise<T[]> {
    const prefilteredQuery = await this.authorizeRead(user, this.collection);
    if (!prefilteredQuery)
      throw new Status(
        403,
        `Lecture refusée sur ressource ${this.collection.path}`,
      );
    return (
      await this.applyQueryOptions(
        prefilteredQuery
          .where(field, '>=', prefix)
          .where(field, '<=', prefix + '\u{10FFFF}'),
        queryOptions,
      ).get()
    ).docs.map((doc) => doc.data());
  }
}

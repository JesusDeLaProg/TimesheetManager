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
import { validate, ValidationError } from 'class-validator';
import { QueryOptions } from '//dtos/query_options';
import { User } from '//dtos/user';
import { Status } from '//types/status';

export interface UniquenessValidationOptions<T> {
  fields: (keyof T)[];
  errorMessage: string;
}

export class ValidationUtils {
  static async validateUnique<T extends { _id?: StringId }>(
    collection: CollectionReference<T>,
    object: T,
    options: UniquenessValidationOptions<T>[],
  ) {
    const errors = [] as ValidationError[];
    for (const option of options) {
      let query = collection as Query<T>;
      for (const field of option.fields) {
        query = query.where(field as string, '==', object[field]);
      }
      const duplicates = await query.get();
      if (!duplicates.empty && duplicates.docs[0].id !== object._id) {
        for (const field of option.fields) {
          errors.push({
            target: object,
            property: field as string,
            value: object[field],
            constraints: {
              unique: option.errorMessage,
            },
          });
        }
      }
    }
    return errors;
  }
}

type ValidationResult<T> = { [key in keyof T]?: string[] } & {
  __success: boolean;
};
type MutationResult<T> = T & { __success: true };
export class CrudService<T extends { _id?: StringId }> {
  private documentConverter: FirestoreDataConverter<T>;
  protected collection: CollectionReference<T>;

  constructor(
    collection: CollectionReference<T>,
    private objectClass: ClassConstructor<T>,
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
  }

  private applyErrors(from: ValidationError[], to: ValidationResult<T>) {
    for (const error of from) {
      if (to[error.property] === undefined) {
        to[error.property] = [];
      }
      to[error.property].push(...Object.values(error.constraints));
    }
  }

  protected authorizeRead(user: User, originalDocumentOrQuery: T): boolean;
  protected authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<T>,
  ): Query<T> | null;
  protected authorizeRead(
    user: User,
    originalDocumentOrQuery: T | Query<T>,
  ): boolean | Query<T> | null {
    if (originalDocumentOrQuery instanceof Query) {
      return null;
    } else {
      return false;
    }
  }

  protected authorizeCreate(user: User, updatedDocument: T): boolean {
    return false;
  }

  protected authorizeUpdate(
    user: User,
    originalDocument: T,
    updatedDocument: T,
  ): boolean {
    return false;
  }
  protected authorizeDelete(user: User, originalDocument: T): boolean {
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
    if (this.authorizeRead(user, result)) {
      return result || null;
    }
    throw new Status(403, `Lecture refusée sur document ${id}`);
  }

  async get(user: User, queryOptions?: QueryOptions): Promise<T[]> {
    const prefilteredQuery = this.authorizeRead(user, this.collection);
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
    const prefilteredQuery = this.authorizeRead(user, this.collection);
    if (!prefilteredQuery)
      throw new Status(
        403,
        `Lecture refusée sur ressource ${this.collection.path}`,
      );
    return (await prefilteredQuery.select().get()).size;
  }

  protected async internalValidate(
    object: T,
    forCreation: boolean,
  ): Promise<ValidationError[]> {
    return [];
  }

  async validate(
    object: any,
    forCreation: boolean,
  ): Promise<ValidationResult<T>> {
    let objectToValidate = object;
    if (!(object instanceof this.objectClass)) {
      objectToValidate = plainToInstance(this.objectClass, object);
    }
    const errors = {} as ValidationResult<T>;
    this.applyErrors(await validate(objectToValidate), errors);
    this.applyErrors(
      await this.internalValidate(objectToValidate, forCreation),
      errors,
    );
    errors.__success = Object.entries(errors).length === 0;
    return errors;
  }

  async create(
    user: User,
    object: any,
  ): Promise<ValidationResult<T> | MutationResult<T>> {
    const newDocument = plainToInstance(this.objectClass, object);
    const validationResult = await this.validate(newDocument, true);
    if (!validationResult.__success) {
      return validationResult;
    } else {
      if (this.authorizeCreate(user, newDocument)) {
        return Object.assign(
          { __success: true as true },
          (await (await this.collection.add(newDocument)).get()).data(),
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
  ): Promise<ValidationResult<T> | MutationResult<T>> {
    const validationResult = await this.validate(object, false);
    if (!validationResult.__success) {
      return validationResult;
    } else {
      const originalDocument = await this.getById(user, id);
      const updatedDocument = plainToInstance(this.objectClass, object);
      if (this.authorizeUpdate(user, originalDocument, updatedDocument)) {
        const docRef = this.collection.doc(id);
        await docRef.set(updatedDocument);
        return Object.assign(
          { __success: true as true },
          (await docRef.get()).data(),
        );
      } else {
        throw new Status(403, `Mise à jour refusée sur document ${id}`);
      }
    }
  }

  async delete(user: User, id: string): Promise<boolean> {
    const originalDocument = await this.getById(user, id);
    if (this.authorizeDelete(user, originalDocument)) {
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
    const prefilteredQuery = this.authorizeRead(user, this.collection);
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
    const prefilteredQuery = this.authorizeRead(user, this.collection);
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

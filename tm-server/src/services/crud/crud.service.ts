import { CollectionReference, Query } from '@google-cloud/firestore';
import { StringId } from '@tm/types/models/datamodels';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { QueryOptions } from '//dtos/query_options';
import { User } from '//dtos/user';
import { ObjectValidator, ValidationResult } from '//types/validator';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

export type MutationResult<T> = ValidationResult<T>;
export class CrudService<T extends { _id?: StringId }> {
  constructor(
    private collection: CollectionReference<T>,
    private objectClass: ClassConstructor<T>,
    private objectValidator: ObjectValidator<T>,
  ) {}

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
    throw new ForbiddenException(`Lecture refusée sur document ${id}`);
  }

  async get(user: User, queryOptions?: QueryOptions): Promise<T[]> {
    const prefilteredQuery = await this.authorizeRead(user, this.collection);
    if (!prefilteredQuery)
      throw new ForbiddenException(
        `Lecture refusée sur ressource ${this.collection.path}`,
      );
    return (
      await this.applyQueryOptions(prefilteredQuery, queryOptions).get()
    ).docs.map((doc) => doc.data());
  }

  async count(user: User): Promise<number> {
    const prefilteredQuery = await this.authorizeRead(user, this.collection);
    if (!prefilteredQuery)
      throw new ForbiddenException(
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
        throw new ForbiddenException(
          `Création refusée sur ressource ${this.collection.path}`,
        );
      }
    }
  }

  async update(user: User, object: any): Promise<MutationResult<T>> {
    const validationResult = await this.validate(object);
    if (!validationResult.__success) {
      return validationResult;
    } else {
      const id = object._id;
      if (!id) {
        throw new BadRequestException('id manquant');
      }
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
        throw new ForbiddenException(`Mise à jour refusée sur document ${id}`);
      }
    }
  }

  async delete(user: User, id: string): Promise<boolean> {
    const originalDocument = await this.getById(user, id);
    if (await this.authorizeDelete(user, originalDocument)) {
      await this.collection.doc(id).delete();
      return true;
    }
    throw new ForbiddenException(`Suppression refusée sur document ${id}`);
  }

  async searchByField(
    user: User,
    field: string,
    value: any,
    queryOptions?: QueryOptions,
  ): Promise<T[]> {
    const prefilteredQuery = await this.authorizeRead(user, this.collection);
    if (!prefilteredQuery)
      throw new ForbiddenException(
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
      throw new ForbiddenException(
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

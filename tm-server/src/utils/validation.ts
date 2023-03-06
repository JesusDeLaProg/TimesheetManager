import { CollectionReference, Query } from '@google-cloud/firestore';
import { StringId } from '@tm/types/models/datamodels';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ValidationError } from 'class-validator';
import { ObjectValidator, ValidationResult } from '../types/validator';

export interface UniquenessValidationOptions<T> {
  fields: (keyof T)[];
  errorMessage: string;
}

export class BaseObjectValidator<T extends { _id?: StringId }> implements ObjectValidator<T> {

  constructor(protected collection: CollectionReference<T>, protected objectClass: ClassConstructor<T>) {}

  protected convertToTypedObject(object: unknown): T {
    if (object instanceof this.objectClass) {
      return object;
    }
    return plainToInstance(this.objectClass, object);
  }

  protected convertErrorsToValidationResult(object: T, errors: ValidationError[]): ValidationResult<T> {
    if (errors.length === 0) {
      return Object.assign(object, { __success: true });
    } else {
      const validationResult: ValidationResult<T> = { __success: false };
      for (const error of errors) {
        if (validationResult[error.property] === undefined) {
          validationResult[error.property] = [];
        }
        validationResult[error.property].push(...Object.values(error.constraints));
      }
    }
  }

  protected async combineValidators(object: T, failfast: boolean, ...validators: ((object: T) => Promise<ValidationError[]>)[]) {
    const errors = [];
    for(const validator of validators) {
      if (errors.length > 0 && failfast) {
        break;
      } else {
        errors.push(...(await validator(object)));
      }
    }
    return this.convertErrorsToValidationResult(object, errors);
  }

  protected async validateUnique(
    object: T,
    options: UniquenessValidationOptions<T>[],
  ): Promise<ValidationError[]> {
    const errors = [] as ValidationError[];
    for (const option of options) {
      let query = this.collection as Query<T>;
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

  validateForCreate(object: unknown): Promise<ValidationResult<T>> {
    throw new Error('Method not implemented.');
  }
  validateForUpdate(object: unknown): Promise<ValidationResult<T>> {
    throw new Error('Method not implemented.');
  }
}

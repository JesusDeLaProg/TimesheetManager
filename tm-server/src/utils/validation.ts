import { CollectionReference, Query, Timestamp } from '@google-cloud/firestore';
import { StringId } from '//types/models/datamodels';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ObjectValidator, ValidationResult } from '//types/validator';
import { DateTime } from 'luxon';

export interface UniquenessValidationOptions<T> {
  fields: (keyof T)[];
  errorMessage: string;
}

export function normalizeDate(
  value: Date | Timestamp,
  timeOfDay?: 'startOf' | 'endOf',
) {
  if (value instanceof Timestamp) {
    value = value.toDate();
  }
  if (!value || value.valueOf() === 0) {
    return value;
  }
  return timeOfDay
    ? DateTime.fromJSDate(value)[timeOfDay]('day').toJSDate()
    : value;
}

export abstract class BaseObjectValidator<T extends { _id?: StringId }>
  implements ObjectValidator<T>
{
  protected VALIDATORS: ((obj: T) => Promise<ValidationError[]>)[] = [
    (obj: T) => validate(obj),
  ];

  constructor(
    protected collection: CollectionReference<T>,
    protected objectClass: ClassConstructor<T>,
  ) {}

  protected convertToTypedObject(object: unknown): T {
    if (object instanceof this.objectClass) {
      this.normalize(object);
      return object;
    }
    const obj = plainToInstance(this.objectClass, object);
    this.normalize(obj);
    return obj;
  }

  protected convertErrorsToValidationResult(
    object: T,
    errors: ValidationError[],
  ): ValidationResult<T> {
    if (errors.length === 0) {
      return { __success: true, value: object };
    } else {
      return { __success: false, errors };
    }
  }

  protected async combineValidators(
    object: T,
    failfast: boolean,
    ...validators: ((object: T) => Promise<ValidationError[]>)[]
  ) {
    const errors: ValidationError[] = [];
    for (const validator of validators) {
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
              isUnique: option.errorMessage,
            },
          });
        }
      }
    }
    return errors;
  }

  protected async validateForeignKey(
    object: any,
    property: string,
    key: StringId,
    collection: CollectionReference,
    propertyMessage?: string,
  ): Promise<ValidationError | null> {
    const error = Object.assign(new ValidationError(), {
      property,
      target: object,
      value: key,
      constraints: {
        isForeignKey: `${
          propertyMessage ?? property
        } doit faire référence à un objet existant dans la collection ${
          collection.id
        }`,
      },
    } as ValidationError);
    if (!key) return error;

    if (!(await collection.doc(key).get()).exists) {
      return error;
    }
    return null;
  }

  protected normalize(object: T): void {}

  validate(object: unknown): Promise<ValidationResult<T>> {
    return this.combineValidators(
      this.convertToTypedObject(object),
      true,
      ...this.VALIDATORS,
    );
  }
}

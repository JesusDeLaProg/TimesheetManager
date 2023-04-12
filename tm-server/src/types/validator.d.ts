import { CollectionReference } from '@google-cloud/firestore';
import { ValidationError } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

export type ValidationResult<T> =
  | (T & { __success: true })
  | { __success: false; errors: ValidationError[] };

export interface ObjectValidator<T> {
  validate(object: unknown): Promise<ValidationResult<T>>;
}

export interface ObjectValidatorConstructor<T> {
  new (
    collection: CollectionReference<T>,
    objectClass: ClassConstructor<T>,
  ): ObjectValidator<T>;
}

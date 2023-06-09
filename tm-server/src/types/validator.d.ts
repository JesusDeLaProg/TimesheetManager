import { ValidationError } from '@nestjs/common';

export type ValidationResult<T> =
  | (T & { __success: true })
  | { __success: false; errors: ValidationError[] };

export interface ObjectValidator<T> {
  validate(object: unknown): Promise<ValidationResult<T>>;
}

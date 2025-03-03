import { ValidationError } from 'class-validator';

export type ValidationResult<T> =
  | { __success: true; value: T }
  | { __success: false; errors: ValidationError[] };

export interface ObjectValidator<T> {
  validate(object: unknown): Promise<ValidationResult<T>>;
}

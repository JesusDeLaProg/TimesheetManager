import { ValidationError } from "class-validator";

export type ValidationResult<T> = ({} | T | { [key in keyof T]?: string[] }) & {
    __success: boolean;
};

export interface ObjectValidator<T> {
    validateForCreate(object: unknown): Promise<ValidationResult<T>>;
    validateForUpdate(object: unknown): Promise<ValidationResult<T>>;
}

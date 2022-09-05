import { CollectionReference, Query } from "@google-cloud/firestore";
import { StringId } from "@tm/types/models/datamodels";
import { ValidationError } from "class-validator";

export interface UniquenessValidationOptions<T> {
fields: (keyof T)[];
errorMessage: string;
};
  
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
};
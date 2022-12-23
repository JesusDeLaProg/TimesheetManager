import {
  CollectionReference,
  DocumentReference,
  Query,
} from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IUser, UserRole } from '@tm/types/models/datamodels';
import { ValidationError } from 'class-validator';
import { CrudService } from '//services/crud/crud.service';
import { ROOT_DOC } from '//config/constants';
import { User } from '//dtos/user';
import { ValidationUtils } from '//utils/validation';

@Injectable()
export class UserService extends CrudService<IUser> {
  constructor(@Inject(ROOT_DOC) root: DocumentReference) {
    super(root.collection('user') as CollectionReference<IUser>, User);
  }

  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IUser,
  ): Promise<boolean>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<IUser>,
  ): Promise<Query<IUser>>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IUser | Query<IUser>,
  ): Promise<boolean | Query<IUser>> {
    if (originalDocumentOrQuery instanceof Query) {
      switch (user.role) {
        case UserRole.USER:
          return originalDocumentOrQuery.where('username', '==', user.username);
        case UserRole.SUBADMIN:
        case UserRole.ADMIN:
        case UserRole.SUPERADMIN:
          return originalDocumentOrQuery;
        default:
          return null;
      }
    } else {
      switch (user.role) {
        case UserRole.USER:
          return originalDocumentOrQuery._id === user._id;
        case UserRole.SUBADMIN:
        case UserRole.ADMIN:
        case UserRole.SUPERADMIN:
          return true;
        default:
          return false;
      }
    }
  }

  protected async authorizeCreate(
    user: User,
    updatedDocument: IUser,
  ): Promise<boolean> {
    switch (user.role) {
      case UserRole.USER:
        return false;
      case UserRole.SUBADMIN:
      case UserRole.ADMIN:
      case UserRole.SUPERADMIN:
        return updatedDocument.role <= user.role;
      default:
        return false;
    }
  }

  protected async authorizeUpdate(
    user: User,
    originalDocument: IUser,
    updatedDocument: IUser,
  ): Promise<boolean> {
    switch (user.role) {
      case UserRole.USER:
        return false;
      case UserRole.SUBADMIN:
      case UserRole.ADMIN:
      case UserRole.SUPERADMIN:
        return (
          originalDocument.role <= user.role &&
          updatedDocument.role <= user.role
        );
      default:
        return false;
    }
  }

  protected async internalValidate(
    user: IUser,
    forCreation: boolean,
  ): Promise<ValidationError[]> {
    const errors = await ValidationUtils.validateUnique(this.collection, user, [
      {
        fields: ['username'],
        errorMessage: "Le nom d'utilisateur doit être unique.",
      },
      { fields: ['email'], errorMessage: 'Le courriel doit être unique.' },
      {
        fields: ['firstName', 'lastName'],
        errorMessage: 'Le nom complet doit être unique.',
      },
    ]);
    if (forCreation) {
      if (!user.password) {
        errors.push({
          target: user,
          property: 'password',
          value: user.password,
          constraints: { notEmpty: 'Vous devez choisir un mot de passe.' },
        });
      }
    }
    return errors;
  }
}

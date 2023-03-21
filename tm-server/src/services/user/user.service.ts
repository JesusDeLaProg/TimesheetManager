import {
  CollectionReference,
  DocumentReference,
  Query,
} from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IUser, UserRole } from '@tm/types/models/datamodels';
import { CrudService } from '//services/crud/crud.service';
import { ROOT_DOC } from '//config/constants';
import { User, UserValidator } from '//dtos/user';

@Injectable()
export class UserService extends CrudService<IUser> {
  constructor(@Inject(ROOT_DOC) root: DocumentReference) {
    super(
      root.collection('user') as CollectionReference<IUser>,
      User,
      UserValidator,
    );
  }

  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IUser,
  ): Promise<boolean>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<IUser>,
  ): Promise<Query<IUser> | null>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IUser | Query<IUser>,
  ): Promise<boolean | Query<IUser> | null> {
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
          return !!originalDocumentOrQuery && originalDocumentOrQuery._id === user._id;
        case UserRole.SUBADMIN:
        case UserRole.ADMIN:
        case UserRole.SUPERADMIN:
          return !!originalDocumentOrQuery;
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
}

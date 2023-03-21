import {
  CollectionReference,
  DocumentReference,
  Query,
} from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { ITimesheet, IUser, UserRole } from '@tm/types/models/datamodels';
import { CrudService } from '../crud/crud.service';
import { ROOT_DOC } from '//config/constants';
import { Timesheet, TimesheetValidator } from '//dtos/timesheet';
import { User } from '//dtos/user';

@Injectable()
export class TimesheetService extends CrudService<ITimesheet> {
  private readonly Users: CollectionReference<IUser>;

  constructor(@Inject(ROOT_DOC) root: DocumentReference) {
    super(
      root.collection('timesheet') as CollectionReference<ITimesheet>,
      Timesheet,
      TimesheetValidator,
    );
    this.Users = root.collection('user') as CollectionReference<IUser>;
  }

  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: ITimesheet,
  ): Promise<boolean>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<ITimesheet>,
  ): Promise<Query<ITimesheet> | null>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: ITimesheet | Query<ITimesheet>,
  ): Promise<boolean | Query<ITimesheet> | null> {
    if (originalDocumentOrQuery instanceof Query) {
      if (user.role > UserRole.USER) {
        return originalDocumentOrQuery;
      } else {
        return originalDocumentOrQuery.where('user', '==', user._id);
      }
    } else {
      return !!originalDocumentOrQuery && (
        user.role > UserRole.USER || originalDocumentOrQuery.user === user._id
      );
    }
  }

  protected async authorizeCreate(
    user: User,
    updatedDocument: ITimesheet,
  ): Promise<boolean> {
    if (user._id === updatedDocument.user) {
      return true;
    }
    const newOwner = (await this.Users.doc(updatedDocument.user).get()).data();
    return user.role > newOwner.role;
  }

  protected async authorizeUpdate(
    user: User,
    originalDocument: ITimesheet,
    updatedDocument: ITimesheet,
  ): Promise<boolean> {
    if (
      user._id === originalDocument.user &&
      user._id === updatedDocument.user
    ) {
      return true;
    }
    const originalOwner = this.Users.doc(originalDocument.user).get();
    const newOwner =
      originalDocument.user === updatedDocument.user
        ? originalOwner
        : this.Users.doc(updatedDocument.user).get();
    return (
      (user._id === originalDocument.user ||
        user.role > (await originalOwner).data().role) &&
      (user._id === updatedDocument.user ||
        user.role > (await newOwner).data().role)
    );
  }
}

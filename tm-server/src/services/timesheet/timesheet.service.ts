import { CollectionReference, Query } from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { ITimesheet, UserRole } from '@tm/types/models/datamodels';
import { CrudService } from '//services/crud/crud.service';
import { TIMESHEETS, USERS } from '//config/constants';
import { Timesheet, TimesheetValidator } from '//dtos/timesheet';
import { User } from '//dtos/user';

@Injectable()
export class TimesheetService extends CrudService<ITimesheet> {
  constructor(
    @Inject(TIMESHEETS) timesheets: CollectionReference<Timesheet>,
    @Inject(USERS) private users: CollectionReference<User>,
    validator: TimesheetValidator,
  ) {
    super(timesheets, Timesheet, validator);
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
      return (
        !!originalDocumentOrQuery &&
        (user.role > UserRole.USER || originalDocumentOrQuery.user === user._id)
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
    const newOwner = (await this.users.doc(updatedDocument.user).get()).data();
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
    const originalOwner = this.users.doc(originalDocument.user).get();
    const newOwner =
      originalDocument.user === updatedDocument.user
        ? originalOwner
        : this.users.doc(updatedDocument.user).get();
    return (
      (user._id === originalDocument.user ||
        user.role > (await originalOwner).data().role) &&
      (user._id === updatedDocument.user ||
        user.role > (await newOwner).data().role)
    );
  }
}

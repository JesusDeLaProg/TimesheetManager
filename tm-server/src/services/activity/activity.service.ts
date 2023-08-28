import { CollectionReference, Query } from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IActivity, UserRole } from '//types/models/datamodels';
import { Activity, ActivityValidator } from '//dtos/activity';
import { User } from '//dtos/user';
import { CrudService } from '//services/crud/crud.service';
import { AuthorizationUtils } from '//utils/authorization';
import { ACTIVITIES } from '//config/constants';

@Injectable()
export class ActivityService extends CrudService<IActivity> {
  constructor(
    @Inject(ACTIVITIES) activities: CollectionReference<Activity>,
    validator: ActivityValidator,
  ) {
    super(activities, Activity, validator);
  }

  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IActivity,
  ): Promise<boolean>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<IActivity>,
  ): Promise<Query<IActivity> | null>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IActivity | Query<IActivity>,
  ): Promise<boolean | Query<IActivity> | null> {
    return AuthorizationUtils.authorizeReadForRoleAtLeast(
      user,
      UserRole.USER,
      originalDocumentOrQuery,
    );
  }

  protected async authorizeCreate(
    user: User,
    updatedDocument: IActivity,
  ): Promise<boolean> {
    return user.role >= UserRole.SUBADMIN;
  }

  protected async authorizeUpdate(
    user: User,
    originalDocument: IActivity,
    updatedDocument: IActivity,
  ): Promise<boolean> {
    return user.role >= UserRole.SUBADMIN;
  }
}

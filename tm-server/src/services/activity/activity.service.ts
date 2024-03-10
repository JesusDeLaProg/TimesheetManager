import { CollectionReference } from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IActivity, UserRole } from '//types/models/datamodels';
import { Activity, ActivityValidator } from '//dtos/activity';
import { CrudService } from '//services/crud/crud.service';
import { ACTIVITIES } from '//config/constants';

@Injectable()
export class ActivityService extends CrudService<IActivity> {
  constructor(
    @Inject(ACTIVITIES) activities: CollectionReference<Activity>,
    validator: ActivityValidator,
  ) {
    super(activities, validator);
    this.acls = {
      read: new Set([
        UserRole.USER,
        UserRole.SUBADMIN,
        UserRole.ADMIN,
        UserRole.SUPERADMIN,
      ]),
      create: new Set([UserRole.SUBADMIN, UserRole.ADMIN, UserRole.SUPERADMIN]),
      update: new Set([UserRole.SUBADMIN, UserRole.ADMIN, UserRole.SUPERADMIN]),
    };
  }
}

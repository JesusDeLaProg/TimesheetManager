import { CollectionReference } from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IPhase, UserRole } from '//types/models/datamodels';
import { CrudService } from '//services/crud/crud.service';
import { Phase, PhaseValidator } from '//dtos/phase';
import { PHASES } from '//config/constants';

@Injectable()
export class PhaseService extends CrudService<IPhase> {
  constructor(
    @Inject(PHASES) phases: CollectionReference<Phase>,
    validator: PhaseValidator,
  ) {
    super(phases, validator);
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

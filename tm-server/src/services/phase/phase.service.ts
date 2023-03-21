import {
  CollectionReference,
  DocumentReference,
  Query,
} from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IPhase, UserRole } from '@tm/types/models/datamodels';
import { CrudService } from '../crud/crud.service';
import { ROOT_DOC } from '//config/constants';
import { Phase, PhaseValidator } from '//dtos/phase';
import { User } from '//dtos/user';
import { AuthorizationUtils } from '//utils/authorization';

@Injectable()
export class PhaseService extends CrudService<IPhase> {
  constructor(@Inject(ROOT_DOC) root: DocumentReference) {
    super(
      root.collection('phase') as CollectionReference<IPhase>,
      Phase,
      PhaseValidator,
    );
  }

  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IPhase,
  ): Promise<boolean>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<IPhase>,
  ): Promise<Query<IPhase> | null>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IPhase | Query<IPhase>,
  ): Promise<boolean | Query<IPhase> | null> {
    return AuthorizationUtils.authorizeReadForRoleAtLeast(
      user,
      UserRole.USER,
      originalDocumentOrQuery,
    );
  }

  protected async authorizeCreate(
    user: User,
    updatedDocument: IPhase,
  ): Promise<boolean> {
    return user.role >= UserRole.SUBADMIN;
  }

  protected async authorizeUpdate(
    user: User,
    originalDocument: IPhase,
    updatedDocument: IPhase,
  ): Promise<boolean> {
    return user.role >= UserRole.SUBADMIN;
  }
}

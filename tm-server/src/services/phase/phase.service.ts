import { CollectionReference, DocumentReference, Query } from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IPhase, UserRole } from '@tm/types/models/datamodels';
import { CrudService } from '../crud/crud.service';
import { ROOT_DOC } from '//config/constants';
import { Phase } from '//dtos/phase';
import { User } from '//dtos/user';
import { AuthorizationUtils } from '//utils/authorization';

@Injectable()
export class PhaseService extends CrudService<IPhase> {
    constructor(@Inject(ROOT_DOC) root: DocumentReference) {
        super(root.collection('phase') as CollectionReference<IPhase>, Phase)
    }

    protected authorizeRead(user: User, originalDocumentOrQuery: IPhase): boolean;
    protected authorizeRead(user: User, originalDocumentOrQuery: Query<IPhase>): Query<IPhase>;
    protected authorizeRead(user: User, originalDocumentOrQuery: IPhase | Query<IPhase>): boolean | Query<IPhase> {
        return AuthorizationUtils.authorizeReadForRoleAtLeast(user, UserRole.USER, originalDocumentOrQuery);
    }

    protected authorizeCreate(user: User, updatedDocument: IPhase): boolean {
        return user.role >= UserRole.SUBADMIN;
    }

    protected authorizeUpdate(user: User, originalDocument: IPhase, updatedDocument: IPhase): boolean {
        return user.role >= UserRole.SUBADMIN;
    }
}

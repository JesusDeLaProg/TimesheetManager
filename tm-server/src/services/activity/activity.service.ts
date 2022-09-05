import { CollectionReference, DocumentReference, Query } from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IActivity, UserRole } from '@tm/types/models/datamodels';
import { ROOT_DOC } from '//config/constants';
import { Activity } from '//dtos/activity';
import { User } from '//dtos/user';
import { CrudService } from '//services/crud/crud.service';
import { AuthorizationUtils } from '//utils/authorization';

@Injectable()
export class ActivityService extends CrudService<IActivity> {
    constructor(@Inject(ROOT_DOC) root: DocumentReference) {
      super(root.collection('activity') as CollectionReference<IActivity>, Activity);
    }

    protected authorizeRead(user: User, originalDocumentOrQuery: IActivity): boolean;
    protected authorizeRead(user: User, originalDocumentOrQuery: Query<IActivity>): Query<IActivity>;
    protected authorizeRead(user: User, originalDocumentOrQuery: IActivity | Query<IActivity>): boolean | Query<IActivity> {
        return AuthorizationUtils.authorizeReadForRoleAtLeast(user, UserRole.USER, originalDocumentOrQuery);
    }

    protected authorizeCreate(user: User, updatedDocument: IActivity): boolean {
        return user.role >= UserRole.SUBADMIN;
    }

    protected authorizeUpdate(user: User, originalDocument: IActivity, updatedDocument: IActivity): boolean {
        return user.role >= UserRole.SUBADMIN;
    }

}

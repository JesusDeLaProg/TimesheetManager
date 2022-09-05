import {
  CollectionReference,
  DocumentReference,
  Query,
} from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IProject, UserRole } from '@tm/types/models/datamodels';
import { ROOT_DOC } from '//config/constants';
import { Project } from '//dtos/project';
import { QueryOptions } from '//dtos/query_options';
import { User } from '//dtos/user';
import { CrudService } from '//services/crud/crud.service';
import { AuthorizationUtils } from '//utils/authorization';

@Injectable()
export class ProjectService extends CrudService<IProject> {
  constructor(@Inject(ROOT_DOC) root: DocumentReference) {
    super(root.collection('project') as CollectionReference<IProject>, Project);
  }

  protected authorizeRead(
    user: User,
    originalDocumentOrQuery: IProject<string>,
  ): boolean;
  protected authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<IProject<string>>,
  ): Query<IProject<string>>;
  protected authorizeRead(
    user: User,
    originalDocumentOrQuery: IProject | Query<IProject>,
  ): boolean | Query<IProject> {
    return AuthorizationUtils.authorizeReadForRoleAtLeast(user, UserRole.USER, originalDocumentOrQuery);
  }

  protected authorizeCreate(
    user: User,
    updatedDocument: IProject<string>,
  ): boolean {
    return user.role >= UserRole.SUBADMIN;
  }

  protected authorizeUpdate(
    user: User,
    originalDocument: IProject<string>,
    updatedDocument: IProject<string>,
  ): boolean {
    return user.role >= UserRole.SUBADMIN;
  }

  public searchByCodePrefix(
    user: User,
    codePrefix: string,
    queryOptions?: QueryOptions,
  ): Promise<IProject[]> {
    if (!codePrefix) return Promise.resolve([]);

    return super.prefixSearchByField(user, 'code', codePrefix, queryOptions);
  }
}

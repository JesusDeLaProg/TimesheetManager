import { CollectionReference, Query } from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IProject, UserRole } from '//types/models/datamodels';
import { PROJECTS } from '//config/constants';
import { Project, ProjectValidator } from '//dtos/project';
import { QueryOptions } from '//dtos/query_options';
import { User } from '//dtos/user';
import { CrudService } from '//services/crud/crud.service';
import { AuthorizationUtils } from '//utils/authorization';

@Injectable()
export class ProjectService extends CrudService<IProject> {
  constructor(
    @Inject(PROJECTS) projects: CollectionReference<Project>,
    validator: ProjectValidator,
  ) {
    super(projects, Project, validator);
  }

  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IProject,
  ): Promise<boolean>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<IProject>,
  ): Promise<Query<IProject> | null>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: IProject | Query<IProject>,
  ): Promise<boolean | Query<IProject> | null> {
    return AuthorizationUtils.authorizeReadForRoleAtLeast(
      user,
      UserRole.USER,
      originalDocumentOrQuery,
    );
  }

  protected async authorizeCreate(
    user: User,
    updatedDocument: IProject,
  ): Promise<boolean> {
    return user.role >= UserRole.SUBADMIN;
  }

  protected async authorizeUpdate(
    user: User,
    originalDocument: IProject,
    updatedDocument: IProject,
  ): Promise<boolean> {
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

import { CollectionReference } from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { IProject, UserRole } from '//types/models/datamodels';
import { PROJECTS } from '//config/constants';
import { Project, ProjectValidator } from '//dtos/project';
import { QueryOptions } from '//dtos/query_options';
import { User } from '//dtos/user';
import { CrudService } from '//services/crud/crud.service';

@Injectable()
export class ProjectService extends CrudService<IProject> {
  constructor(
    @Inject(PROJECTS) projects: CollectionReference<Project>,
    validator: ProjectValidator,
  ) {
    super(projects, validator);
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

  public searchByCodePrefix(
    user: User,
    codePrefix: string,
    queryOptions?: QueryOptions,
  ): Promise<IProject[]> {
    if (!codePrefix) return Promise.resolve([]);

    return super.prefixSearchByField(user, 'code', codePrefix, queryOptions);
  }
}

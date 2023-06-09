import { CollectionReference, Query } from '@google-cloud/firestore';
import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '@tm/types/models/datamodels';
import { CrudService, MutationResult } from '//services/crud/crud.service';
import { USERS } from '//config/constants';
import { User, UserValidator } from '//dtos/user';
import { QueryOptions } from '//dtos/query_options';
import { AuthService } from '//services/auth/auth.service';
import { AuthorizationUtils } from '//utils/authorization';

@Injectable()
export class UserService extends CrudService<User> {
  constructor(
    @Inject(USERS) users: CollectionReference<User>,
    validator: UserValidator,
    private authService: AuthService,
  ) {
    super(users, User, validator);
  }

  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: User,
  ): Promise<boolean>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: Query<User>,
  ): Promise<Query<User> | null>;
  protected async authorizeRead(
    user: User,
    originalDocumentOrQuery: User | Query<User>,
  ): Promise<boolean | Query<User> | null> {
    return AuthorizationUtils.authorizeReadForRoleAtLeast(
      user,
      UserRole.SUBADMIN,
      originalDocumentOrQuery,
    );
  }

  protected async authorizeCreate(
    user: User,
    updatedDocument: User,
  ): Promise<boolean> {
    switch (user.role) {
      case UserRole.USER:
        return false;
      case UserRole.SUBADMIN:
      case UserRole.ADMIN:
      case UserRole.SUPERADMIN:
        return updatedDocument.role <= user.role;
      default:
        return false;
    }
  }

  protected async authorizeUpdate(
    user: User,
    originalDocument: User,
    updatedDocument: User,
  ): Promise<boolean> {
    switch (user.role) {
      case UserRole.USER:
        return false;
      case UserRole.SUBADMIN:
      case UserRole.ADMIN:
      case UserRole.SUPERADMIN:
        return (
          originalDocument.role <= user.role &&
          updatedDocument.role <= user.role
        );
      default:
        return false;
    }
  }

  async getById(user: User, id: string): Promise<User> {
    const ret = await super.getById(user, id);
    if (ret) {
      delete ret.password;
    }
    return ret;
  }

  async get(user: User, queryOptions?: QueryOptions): Promise<User[]> {
    const ret = await super.get(user, queryOptions);
    return ret.map((u) => {
      delete u.password;
      return u;
    });
  }

  async create(user: User, object: any): Promise<MutationResult<User>> {
    const ret = await super.create(user, object);
    if (ret.__success) {
      const newPass = ret.password;
      await this.authService.changePassword(ret, newPass);
      delete ret.password;
    }
    return ret;
  }

  async update(user: User, object: any): Promise<MutationResult<User>> {
    const ret = await super.update(user, object);
    if (ret.__success) {
      if (ret.password) {
        const newPass = ret.password;
        await this.authService.changePassword(ret, newPass);
      }
      delete ret.password;
    }
    return ret;
  }
}

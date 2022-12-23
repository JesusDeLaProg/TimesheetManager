import { Query } from '@google-cloud/firestore';
import { UserRole } from '@tm/types/models/datamodels';
import { User } from '//dtos/user';

export class AuthorizationUtils {
  static authorizeReadForRoleAtLeast<T>(
    user: User,
    minimumRole: UserRole,
    originalDocumentOrQuery: T,
  ): boolean;
  static authorizeReadForRoleAtLeast<T>(
    user: User,
    minimumRole: UserRole,
    originalDocumentOrQuery: Query<T>,
  ): Query<T>;
  static authorizeReadForRoleAtLeast<T>(
    user: User,
    minimumRole: UserRole,
    originalDocumentOrQuery: T | Query<T>,
  ): boolean | Query<T> {
    if (originalDocumentOrQuery instanceof Query) {
      if (user.role >= minimumRole) {
        return originalDocumentOrQuery;
      } else {
        return null;
      }
    }
    return user.role >= minimumRole;
  }
}

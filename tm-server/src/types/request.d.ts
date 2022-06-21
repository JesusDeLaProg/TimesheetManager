import { Request } from 'express';
import { User } from '//dtos/user';

export interface RequestWithUserInfo extends Request {
  user: User;
}

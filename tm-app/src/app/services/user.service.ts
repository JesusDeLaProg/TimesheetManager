import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { IUser } from '../../../../types/models/datamodels';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<IUser> {
  constructor() {
    super(false, 'user');
  }
}

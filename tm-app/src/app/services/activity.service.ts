import { Injectable } from '@angular/core';
import { IQueryOptions } from '../../../../types/query_options';
import { BehaviorSubject, Observable } from 'rxjs';
import { IActivity } from '../../../../types/models/datamodels';
import { BaseService } from './base.service';

const ACTIVITIES = [
  { _id: 'aaaa', code: 'A1', name: 'Activité 1' },
  { _id: 'bbbb', code: 'A2', name: 'Activité 2' },
  { _id: 'cccc', code: 'A3', name: 'Activité 3' },
  { _id: 'dddd', code: 'A4', name: 'Activité 4' },
];

@Injectable({
  providedIn: 'root'
})
export class ActivityService extends BaseService<IActivity> {
  constructor() {
    super(true, 'activity');
  }

  // TODO: REMOVE
  protected override getWithoutCache(queryOptions: IQueryOptions): Observable<IActivity[]> {
    return new BehaviorSubject(this.applyQueryOptionsLocally(ACTIVITIES, queryOptions));
  }
}

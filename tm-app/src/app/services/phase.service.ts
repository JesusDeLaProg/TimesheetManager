import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { IPhase } from '../../../../types/models/datamodels';
import { IQueryOptions } from '../../../../types/query_options';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhaseService extends BaseService<IPhase> {
  PHASES: IPhase[] = [
    {
      _id: '1111',
      code: 'PH1',
      name: 'Phase 1',
      activities: ['aaaa', 'bbbb', 'cccc', 'dddd'],
    },
    {
      _id: '2222',
      code: 'PH2',
      name: 'Phase 2',
      activities: ['aaaa', 'bbbb', 'cccc'],
    },
    { _id: '3333', code: 'PH3', name: 'Phase 3', activities: ['bbbb', 'cccc'] },
    { _id: '4444', code: 'PH4', name: 'Phase 4', activities: ['dddd'] },
  ];

  constructor() {
    super(true, '/phase/');
  }

  // TODO: REMOVE
  protected override getWithoutCache(queryOptions: IQueryOptions): Observable<IPhase[]> {
    return new BehaviorSubject(this.applyQueryOptionsLocally(this.PHASES, queryOptions));
  }
}

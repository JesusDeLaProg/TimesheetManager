import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ITimesheet } from '../../../../types/models/datamodels';
import { BehaviorSubject, Observable } from 'rxjs';
import { IQueryOptions } from '../../../../types/query_options';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService extends BaseService<ITimesheet> {
  TIMESHEETS = [{
    user: 'Maxime Charland',
    begin: new Date(2024, 0, 7),
    end: new Date(2024, 0, 20),
    lines: [
      {
        project: '24-01',
        phase: '1111',
        activity: 'aaaa',
        entries: [
          { date: new Date(2024, 0, 7), time: 0 },
          { date: new Date(2024, 0, 8), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 9), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 10), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 11), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 12), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 13), time: 0 },
          { date: new Date(2024, 0, 14), time: 0 },
          { date: new Date(2024, 0, 15), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 16), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 17), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 18), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 19), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 20), time: 0 },
        ],
      },
      {
        project: '24-02',
        phase: '3333',
        activity: 'cccc',
        entries: [
          { date: new Date(2024, 0, 7), time: 0 },
          { date: new Date(2024, 0, 8), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 9), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 10), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 11), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 12), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 13), time: 0 },
          { date: new Date(2024, 0, 14), time: 0 },
          { date: new Date(2024, 0, 15), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 16), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 17), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 18), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 19), time: Math.round(Math.random() * 3) },
          { date: new Date(2024, 0, 20), time: 0 },
        ],
      },
    ],
    roadsheetLines: [],
  }];

  constructor() {
    super(false, 'project');
  }

  // TODO: REMOVE
  protected override getWithoutCache(queryOptions: IQueryOptions): Observable<ITimesheet[]> {
    return new BehaviorSubject(this.applyQueryOptionsLocally(this.TIMESHEETS, queryOptions));
  }
}

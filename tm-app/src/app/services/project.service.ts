import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { IProject, ProjectType } from '../../../../types/models/datamodels';
import { BehaviorSubject, Observable } from 'rxjs';
import { IQueryOptions } from '../../../../types/query_options';

const PROJECTS = [
  {
    _id: '19-01',
    code: '19-01',
    name: 'Premier projet',
    type: ProjectType.PUBLIC,
    client: 'Client 1',
    isActive: true,
  },
  {
    _id: '23-01',
    code: '23-01',
    name: 'Deuxième projet',
    type: ProjectType.PUBLIC,
    client: 'Client 1',
    isActive: true,
  },
  {
    _id: '24-01',
    code: '24-01',
    name: 'Troisième projet',
    type: ProjectType.PUBLIC,
    client: 'Client 1',
    isActive: true,
  },
  {
    _id: '24-02',
    code: '24-02',
    name: 'Quatrième projet',
    type: ProjectType.PUBLIC,
    client: 'Client 1',
    isActive: true,
  },
];

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends BaseService<IProject> {
  constructor() {
    super(false, 'project');
  }

  // TODO: REMOVE
  protected override getWithoutCache(queryOptions: IQueryOptions): Observable<IProject[]> {
    return new BehaviorSubject(this.applyQueryOptionsLocally(PROJECTS, queryOptions));
  }

  override search(query: any, queryOptions: IQueryOptions): Observable<IProject[]> {
    return super.search(query, queryOptions);
  }
}

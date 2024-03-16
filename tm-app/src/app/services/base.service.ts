import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, first, firstValueFrom, map, merge } from 'rxjs';
import { IQueryOptions } from '../../../../types/query_options';
import { BACK_END_BASE_URL } from '../constants';
import { MutationResult } from '../../types/interchange';

@Injectable({ providedIn: 'root' })
export abstract class BaseService<T> implements OnDestroy {
  readonly BASE_URL = inject(BACK_END_BASE_URL);
  readonly baseUrl: string;
  readonly http = inject(HttpClient);
  readonly cache = new BehaviorSubject<T[]>([]);
  private _cacheUpdateInterval = 0;

  constructor(private useCache: boolean, baseUrl: string) {
    this.baseUrl = new URL(baseUrl, this.BASE_URL).href + '/';
    if (useCache) {
      firstValueFrom(this.getWithoutCache({})).then(v => this.cache.next(v));
      this._cacheUpdateInterval = window.setInterval(async () => {
        this.cache.next(await firstValueFrom(this.getWithoutCache({})));
      }, 5 * 60 * 1000); // 5 Minutes
    }
  }

  ngOnDestroy(): void {
    window.clearInterval(this._cacheUpdateInterval);
  }

  protected applyQueryOptionsLocally(values: T[], queryOptions: IQueryOptions) {
    let sorted = values;
    const sortOptions = queryOptions.sort ?? [];
    sortOptions.reverse();
    for (const sortOpt of sortOptions) {
      const before = sortOpt.direction === 'asc' ? 1 : -1;
      const after = before * -1;
      sorted = sorted.sort((a: any, b: any) => a === b ? 0 : (a[sortOpt.field] < b[sortOpt.field] ? before : after));
    }
    const start = queryOptions.skip ?? 0;
    const end = queryOptions.limit ? start + queryOptions.limit : undefined;
    return sorted.slice(start, end);
  }

  protected getWithoutCache(queryOptions: IQueryOptions): Observable<T[]> {
    return this.http.get<T[]>((new URL('list', this.baseUrl)).href, { withCredentials: true, params: queryOptions as any });
  }

  get(queryOptions: IQueryOptions, useCache?: boolean): Observable<T[]> {
    if(!this.useCache || useCache === false) {
      return this.getWithoutCache(queryOptions);
    }
    return merge(
      this.cache.asObservable().pipe(map(v => this.applyQueryOptionsLocally(v, queryOptions)), first()),
      this.getWithoutCache(queryOptions)
    );
  }

  getById(id: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(new URL('getbyid/' + id, this.baseUrl).href, { withCredentials: true }));
  }

  create(obj: T): Promise<MutationResult<T>> {
    return firstValueFrom(this.http.post<MutationResult<T>>(new URL('create', this.baseUrl).href, obj, { withCredentials: true }));
  }

  update(obj: T): Promise<MutationResult<T>> {
    return firstValueFrom(this.http.post<MutationResult<T>>(new URL('update', this.baseUrl).href, obj, { withCredentials: true }));
  }

  validate(obj: T): Promise<MutationResult<T>> {
    return firstValueFrom(this.http.post<MutationResult<T>>(new URL('validate', this.baseUrl).href, obj, { withCredentials: true }));
  }

  protected search(query: any, queryOptions: IQueryOptions): Observable<T[]> {
    return this.http.get<T[]>(new URL('search', this.baseUrl).href, { withCredentials: true, params: { q: query, ...queryOptions as any } });
  }

}

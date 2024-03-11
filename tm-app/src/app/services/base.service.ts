import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, first, firstValueFrom, map, merge } from 'rxjs';
import { IQueryOptions } from '../../../../types/query_options';
import { BACK_END_BASE_URL } from '../constants';

@Injectable({ providedIn: 'root' })
export abstract class BaseService<T> implements OnDestroy {
  readonly BASE_URL = inject(BACK_END_BASE_URL);
  readonly http = inject(HttpClient);
  readonly cache = new BehaviorSubject<T[]>([]);
  private _cacheUpdateInterval = 0;

  constructor(useCache: boolean, protected baseUrl: string) {
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
    return this.http.get<T[]>((new URL('/list', this.baseUrl)).href, { params: queryOptions as any });
  }

  get(queryOptions: IQueryOptions): Observable<T[]> {
    return merge(
      this.cache.asObservable().pipe(first(), map(v => this.applyQueryOptionsLocally(v, queryOptions))),
      this.getWithoutCache(queryOptions)
    );
  }

  getById(id: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(new URL('getbyid/' + id, this.BASE_URL).href));
  }

}

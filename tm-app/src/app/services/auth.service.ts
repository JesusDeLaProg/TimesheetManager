import { Inject, Injectable, inject } from '@angular/core';
import { BACK_END_BASE_URL } from '../constants';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly baseUrl: string;

  constructor(private http: HttpClient, @Inject(BACK_END_BASE_URL) baseUrl: string) {
    this.baseUrl = new URL('auth', baseUrl).href + '/';
  }

  login(username: string, password: string): Promise<any> {
    return firstValueFrom(this.http.post(new URL('login', this.baseUrl).href, { username, password }));
  }
}

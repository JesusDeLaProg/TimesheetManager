import { Inject, Injectable } from '@angular/core';
import { BACK_END_BASE_URL } from '../constants';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AuthTokenPayload {
  name: string;
  sub: string;
  iss: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly baseUrl: string;

  constructor(private http: HttpClient, @Inject(BACK_END_BASE_URL) baseUrl: string) {
    this.baseUrl = new URL('auth', baseUrl).href + '/';
  }

  login(username: string, password: string): Promise<AuthTokenPayload> {
    return firstValueFrom(this.http.post<AuthTokenPayload>(new URL('login', this.baseUrl).href, { username, password }, { withCredentials: true }));
  }
}

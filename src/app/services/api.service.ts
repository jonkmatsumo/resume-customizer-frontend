import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  observe?: 'body' | 'events' | 'response';
  params?:
    | HttpParams
    | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/${environment.apiVersion}`;
  private readonly authToken = signal<string | null>(localStorage.getItem('authToken'));

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const token = this.authToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.authToken.set(token);
  }

  clearAuthToken(): void {
    localStorage.removeItem('authToken');
    this.authToken.set(null);
  }

  getAuthToken(): string | null {
    return this.authToken();
  }

  get<T>(endpoint: string, options: ApiOptions = {}): Observable<T> {
    const headers = options.headers || this.getHeaders();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestOptions: any = {
      ...options,
      headers,
    };
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, requestOptions) as Observable<T>;
  }

  post<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
    });
  }

  put<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
    });
  }

  patch<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }
}

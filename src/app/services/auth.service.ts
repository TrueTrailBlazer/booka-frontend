import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { MeResponse } from '../models';

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    role: 'CLIENTE' | 'PROFISSIONAL';
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private TOKEN_KEY = 'token';
  private REFRESH_KEY = 'refresh_token';
  private ROLE_KEY = 'role';

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            const role = response.user?.role || 'CLIENTE';
            localStorage.setItem(this.ROLE_KEY, role);
          }
        }),
        catchError(err => {
          console.error('Login error:', err);
          return throwError(() => err);
        })
      );
  }

  register(nome: string, email: string, password: string, role: 'CLIENTE' | 'PROFISSIONAL'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { 
      nome, 
      email, 
      password, 
      role 
    })
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            const userRole = response.user?.role || role || 'CLIENTE';
            localStorage.setItem(this.ROLE_KEY, userRole);
          }
        }),
        catchError(err => {
          console.error('Register error:', err);
          return throwError(() => err);
        })
      );
  }

  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/auth/me`);
  }

  updateMe(payload: { nome?: string; email?: string }): Observable<{ id: string; nome: string; email: string; role: string }> {
    return this.http.put<{ id: string; nome: string; email: string; role: string }>(`${this.apiUrl}/auth/me`, payload);
  }

  updateSenha(senhaAtual: string, novaSenha: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/auth/senha`, { senhaAtual, novaSenha });
  }

  uploadAvatar(file: File): Observable<{ imagemUrl: string }> {
    const form = new FormData();
    form.append('avatar', file);
    return this.http.post<{ imagemUrl: string }>(`${this.apiUrl}/upload/avatar`, form);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): 'CLIENTE' | 'PROFISSIONAL' {
    if (typeof window === 'undefined') return 'CLIENTE';
    return (localStorage.getItem(this.ROLE_KEY) as any) || 'CLIENTE';
  }

  isProfessional(): boolean {
    return this.getRole() === 'PROFISSIONAL';
  }

  isClient(): boolean {
    return this.getRole() === 'CLIENTE';
  }

}

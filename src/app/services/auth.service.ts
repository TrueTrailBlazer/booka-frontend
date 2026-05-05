import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  login(email: string, senha: string) {
    return this.http.post<{ token: string, usuario?: any }>(`${this.apiUrl}/auth/login`, { email, senha })
      .pipe(
        tap(response => {
          if (response.token) {
            this.handleAuthResponse(response);
          }
        })
      );
  }

  loginWithGoogle(credential: string) {
    return this.http.post<{ token: string, usuario?: any }>(`${this.apiUrl}/auth/google`, { credential })
      .pipe(
        tap(response => {
          if (response.token) {
            this.handleAuthResponse(response);
          }
        })
      );
  }

  private handleAuthResponse(response: { token: string, usuario?: any }) {
    localStorage.setItem('token', response.token);
    const role = response.usuario?.role || 'CLIENTE';
    localStorage.setItem('role', role);
  }

  loginTeste(tipo: 'CLIENTE' | 'PROFISSIONAL') {
    localStorage.setItem('token', 'fake-jwt-token-para-teste');
    localStorage.setItem('role', tipo);
  }

  register(nome: string, email: string, senha: string, role: string) {
    return this.http.post<{ token: string, usuario?: any }>(`${this.apiUrl}/auth/register`, { nome, email, senha, role })
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            const userRole = response.usuario?.role || role || 'CLIENTE';
            localStorage.setItem('role', userRole);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false; // Compatibilidade SSR
    return !!localStorage.getItem('token');
  }

  getRole(): string {
    if (typeof window === 'undefined') return 'CLIENTE';
    return localStorage.getItem('role') || 'CLIENTE';
  }
}

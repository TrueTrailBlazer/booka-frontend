import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Cliente } from '../models';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CreateClienteRequest {
  nome: string;
  email?: string | null;
  telefone: string;
  anotacoes?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clientes`;

  // Listar clientes do profissional logado
  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl)
      .pipe(
        catchError(err => {
          console.error('Erro ao listar clientes:', err);
          return throwError(() => err);
        })
      );
  }

  // Obter um cliente por id
  obter(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(err => {
          console.error('Erro ao obter cliente:', err);
          return throwError(() => err);
        })
      );
  }

  // Criar novo cliente
  criar(dados: CreateClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, dados)
      .pipe(
        catchError(err => {
          console.error('Erro ao criar cliente:', err);
          return throwError(() => err);
        })
      );
  }

  // Atualizar cliente
  atualizar(id: string, dados: Partial<CreateClienteRequest>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, dados)
      .pipe(
        catchError(err => {
          console.error('Erro ao atualizar cliente:', err);
          return throwError(() => err);
        })
      );
  }

  // Deletar cliente
  deletar(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(err => {
          console.error('Erro ao deletar cliente:', err);
          return throwError(() => err);
        })
      );
  }
}

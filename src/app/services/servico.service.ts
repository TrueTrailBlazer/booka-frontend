import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Servico } from '../models';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CreateServicoRequest {
  nome: string;
  descricao?: string | null;
  duracaoMinutos: number;
  preco: number;
  ativo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServicoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/servicos`;

  // Listar serviços do profissional logado
  listar(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.apiUrl)
      .pipe(
        catchError(err => {
          console.error('Erro ao listar serviços:', err);
          return throwError(() => err);
        })
      );
  }

  // Criar novo serviço
  criar(dados: CreateServicoRequest): Observable<Servico> {
    return this.http.post<Servico>(this.apiUrl, dados)
      .pipe(
        catchError(err => {
          console.error('Erro ao criar serviço:', err);
          return throwError(() => err);
        })
      );
  }

  // Atualizar serviço
  atualizar(id: string, dados: Partial<CreateServicoRequest>): Observable<Servico> {
    return this.http.put<Servico>(`${this.apiUrl}/${id}`, dados)
      .pipe(
        catchError(err => {
          console.error('Erro ao atualizar serviço:', err);
          return throwError(() => err);
        })
      );
  }

  // Deletar serviço
  deletar(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(err => {
          console.error('Erro ao deletar serviço:', err);
          return throwError(() => err);
        })
      );
  }
}

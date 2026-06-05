import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Agendamento, StatusAgendamento } from '../models';

export interface CreateAgendamentoRequest {
  clienteId: string;
  servicoId: string;
  inicio: string;
  observacoes?: string | null;
  status?: StatusAgendamento;
}

export interface CreateAgendamentoPublicoRequest {
  lojaId: string;
  servicoId: string;
  inicio: string;
  observacoes?: string | null;
  cliente: {
    nome: string;
    email?: string | null;
    telefone: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/agendamentos`;

  // Cliente criar agendamento (público, sem autenticação)
  criarPublico(dados: CreateAgendamentoPublicoRequest): Observable<Agendamento> {
    return this.http.post<Agendamento>(`${this.apiUrl}/publicos`, dados)
      .pipe(
        catchError(err => {
          console.error('Erro ao criar agendamento público:', err);
          return throwError(() => err);
        })
      );
  }

  // Profissional: listar seus agendamentos (requer autenticação)
  listar(params?: { status?: StatusAgendamento; data?: string; clienteId?: string; servicoId?: string }): Observable<Agendamento[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.data) httpParams = httpParams.set('data', params.data);
      if (params.clienteId) httpParams = httpParams.set('clienteId', params.clienteId);
      if (params.servicoId) httpParams = httpParams.set('servicoId', params.servicoId);
    }
    return this.http.get<Agendamento[]>(this.apiUrl, { params: httpParams })
      .pipe(
        catchError(err => {
          console.error('Erro ao listar agendamentos:', err);
          return throwError(() => err);
        })
      );
  }

  // Profissional: criar agendamento (requer autenticação)
  criar(dados: CreateAgendamentoRequest): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.apiUrl, dados)
      .pipe(
        catchError(err => {
          console.error('Erro ao criar agendamento:', err);
          return throwError(() => err);
        })
      );
  }

  // Profissional: atualizar agendamento (requer autenticação)
  atualizar(id: string, dados: Partial<CreateAgendamentoRequest>): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.apiUrl}/${id}`, dados)
      .pipe(
        catchError(err => {
          console.error('Erro ao atualizar agendamento:', err);
          return throwError(() => err);
        })
      );
  }

  // Profissional: deletar agendamento (requer autenticação)
  deletar(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(err => {
          console.error('Erro ao deletar agendamento:', err);
          return throwError(() => err);
        })
      );
  }

  // Atualizar status
  atualizarStatus(id: string, novoStatus: StatusAgendamento): Observable<Agendamento> {
    return this.atualizar(id, { status: novoStatus });
  }

  // Métodos compatíveis com código legado
  getMeusAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}/meus`);
  }

  cancelar(id: string): Observable<Agendamento> {
    return this.atualizarStatus(id, 'CANCELADO');
  }
}
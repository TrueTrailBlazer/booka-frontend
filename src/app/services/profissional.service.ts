import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Profissional, ProfissionalDetalhe } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/profissionais`;

  // Listagem pública de profissionais
  listar(params?: { q?: string; cidade?: string; categoria?: string; modalidade?: string; precoMax?: number; avaliacaoMinima?: number }): Observable<Profissional[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.q) httpParams = httpParams.set('q', params.q);
      if (params.cidade) httpParams = httpParams.set('cidade', params.cidade);
      if (params.categoria) httpParams = httpParams.set('categoria', params.categoria);
      if (params.modalidade) httpParams = httpParams.set('modalidade', params.modalidade);
      if (params.precoMax !== undefined) httpParams = httpParams.set('precoMax', params.precoMax);
      if (params.avaliacaoMinima !== undefined) httpParams = httpParams.set('avaliacaoMinima', params.avaliacaoMinima);
    }
    return this.http.get<Profissional[]>(this.apiUrl, { params: httpParams })
      .pipe(
        catchError(err => {
          console.error('Erro ao listar profissionais:', err);
          return throwError(() => err);
        })
      );
  }

  // Detalhe público por ID da loja
  obterPorId(id: string): Observable<ProfissionalDetalhe> {
    return this.http.get<ProfissionalDetalhe>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(err => {
          console.error('Erro ao obter profissional:', err);
          return throwError(() => err);
        })
      );
  }

  // Disponibilidade por data, opcionalmente filtrada pela duração do serviço
  obterDisponibilidade(id: string, data: string, servicoId?: string): Observable<{ slots: string[] }> {
    let httpParams = new HttpParams().set('data', data);
    if (servicoId) httpParams = httpParams.set('servicoId', servicoId);
    return this.http.get<{ slots: string[] }>(`${this.apiUrl}/${id}/disponibilidade`, { params: httpParams })
      .pipe(
        catchError(err => {
          console.error('Erro ao obter disponibilidade:', err);
          return throwError(() => err);
        })
      );
  }
}

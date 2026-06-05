import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Loja } from '../models';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


export interface UpdateLojaRequest {
  nome?: string;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  complemento?: string | null;
  estado?: string | null;
  cidade?: string | null;
  descricao?: string | null;
  imagemUrl?: string | null;
  profissao?: string | null;
  categoriaPrincipal?: string | null;
  modalidadePrincipal?: 'ONLINE' | 'PRESENCIAL' | 'HIBRIDO' | null;
  tipoVendedor?: 'AUTONOMO' | 'EMPRESA' | null;
}

@Injectable({
  providedIn: 'root'
})
export class LojaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/loja`;

  // Obter dados da loja do profissional logado
  obter(): Observable<Loja> {
    return this.http.get<Loja>(this.apiUrl)
      .pipe(
        catchError(err => {
          console.error('Erro ao obter loja:', err);
          return throwError(() => err);
        })
      );
  }

  // Atualizar loja
  atualizar(dados: UpdateLojaRequest): Observable<Loja> {
    return this.http.put<Loja>(this.apiUrl, dados)
      .pipe(
        catchError(err => {
          console.error('Erro ao atualizar loja:', err);
          return throwError(() => err);
        })
      );
  }

  // Upload de foto de capa da loja
  uploadCapa(file: File): Observable<{ imagemUrl: string }> {
    const form = new FormData();
    form.append('capa', file);
    return this.http.post<{ imagemUrl: string }>(`${environment.apiUrl}/upload/capa-loja`, form)
      .pipe(
        catchError(err => {
          console.error('Erro ao enviar foto de capa:', err);
          return throwError(() => err);
        })
      );
  }

  // Métodos legados para compatibilidade
  buscarDados(): Observable<Loja> {
    return this.obter();
  }

  atualizarDados(loja: Partial<Loja>): Observable<Loja> {
    return this.atualizar(loja);
  }
}

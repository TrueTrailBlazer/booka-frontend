import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface FinalizeOnboardingRequest {
  nome: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string;
  estado: string;
  cidade: string;
  descricao?: string;
  profissao: string;
  categoriaPrincipal: string;
  modalidadePrincipal: 'ONLINE' | 'PRESENCIAL' | 'HIBRIDO';
  tipoVendedor: 'AUTONOMO' | 'EMPRESA';
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/onboarding`;

  finalizar(dados: FinalizeOnboardingRequest): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/finalizar`, dados)
      .pipe(
        catchError(err => {
          console.error('Erro ao finalizar onboarding:', err);
          return throwError(() => err);
        })
      );
  }
}

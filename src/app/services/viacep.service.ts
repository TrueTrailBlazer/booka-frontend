import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

@Injectable({
  providedIn: 'root',
})
export class ViaCepService {
  private http = inject(HttpClient);

  buscarPorCep(cep: string): Observable<EnderecoViaCep> {
    const cepLimpo = cep.replace(/\D/g, '');
    return this.http
      .get<ViaCepResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .pipe(
        map((res) => {
          if (res.erro) {
            throw new Error('CEP não encontrado');
          }
          return {
            cep: res.cep.replace('-', ''),
            logradouro: res.logradouro,
            bairro: res.bairro,
            cidade: res.localidade,
            estado: res.uf,
          };
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }
}

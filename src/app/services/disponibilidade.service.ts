import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DisponibilidadeSemanal } from '../models';

export interface UpdateDisponibilidadeItem {
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  intervaloMinutos?: number;
  ativo?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DisponibilidadeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/disponibilidade`;

  listar(): Observable<DisponibilidadeSemanal[]> {
    return this.http.get<DisponibilidadeSemanal[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Erro ao listar disponibilidade:', err);
        return throwError(() => err);
      }),
    );
  }

  atualizar(items: UpdateDisponibilidadeItem[]): Observable<DisponibilidadeSemanal[]> {
    return this.http.put<DisponibilidadeSemanal[]>(this.apiUrl, items).pipe(
      catchError((err) => {
        console.error('Erro ao atualizar disponibilidade:', err);
        return throwError(() => err);
      }),
    );
  }
}

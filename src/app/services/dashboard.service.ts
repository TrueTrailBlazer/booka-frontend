import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DashboardResumo {
  loja: {
    id: string;
    nome: string;
  };
  metricas: {
    clientes: number;
    servicosAtivos: number;
    agendamentosHoje: number;
  };
  proximoAgendamento: {
    id: string;
    inicio: string;
    clienteNome: string;
    servicoNome: string;
    status: string;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  obterResumo(): Observable<DashboardResumo> {
    return this.http.get<DashboardResumo>(`${this.apiUrl}/resumo`)
      .pipe(
        catchError(err => {
          console.error('Erro ao obter resumo do dashboard:', err);
          return throwError(() => err);
        })
      );
  }

  get dataHojeISO(): string {
    const hoje = new Date();
    const y = hoje.getFullYear();
    const m = String(hoje.getMonth() + 1).padStart(2, '0');
    const d = String(hoje.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

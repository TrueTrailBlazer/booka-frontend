import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { DashboardService, DashboardResumo } from '../../services/dashboard.service';
import { AgendamentoService } from '../../services/agendamento.service';
import { ToastService } from '../../services/toast.service';
import { Agendamento } from '../../models';
import { forkJoin } from 'rxjs';

import { ModalNovoAgendamentoComponent } from '../../components/modal-novo-agendamento/modal-novo-agendamento.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, NavbarComponent, CommonModule, RouterModule, ModalNovoAgendamentoComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  showModalAgendamento = false;
  resumo: DashboardResumo | null = null;
  agendamentosHoje: Agendamento[] = [];
  isLoading = true;
  errorMessage = '';

  private dashboardService = inject(DashboardService);
  private agendamentoService = inject(AgendamentoService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.carregarDados();
  }

  abrirNovoAgendamento() {
    this.showModalAgendamento = true;
  }

  onAgendamentoCriado() {
    this.carregarDados();
  }

  carregarDados() {
    this.isLoading = true;
    const dataHoje = this.dashboardService.dataHojeISO;

    forkJoin({
      resumo: this.dashboardService.obterResumo(),
      agendamentos: this.agendamentoService.listar({ data: dataHoje }),
    }).subscribe({
      next: ({ resumo, agendamentos }) => {
        this.resumo = resumo;
        this.agendamentosHoje = agendamentos;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard:', err);
        this.errorMessage = 'Erro ao carregar dados do dashboard.';
        this.isLoading = false;
      }
    });
  }

  atualizarStatus(id: string, status: 'CONCLUIDO' | 'CANCELADO') {
    this.agendamentoService.atualizarStatus(id, status).subscribe({
      next: (updated) => {
        const idx = this.agendamentosHoje.findIndex(a => a.id === id);
        if (idx !== -1) this.agendamentosHoje[idx] = updated;
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        alert('Não foi possível atualizar o agendamento.');
      }
    });
  }

  get nomeLoja(): string {
    return this.resumo?.loja?.nome || 'Minha Loja';
  }

  get totalClientes(): number {
    return this.resumo?.metricas?.clientes || 0;
  }

  get totalServicos(): number {
    return this.resumo?.metricas?.servicosAtivos || 0;
  }

  get agendamentosHojeCount(): number {
    return this.resumo?.metricas?.agendamentosHoje || 0;
  }

  get proximoAgendamento() {
    return this.resumo?.proximoAgendamento || null;
  }

  get saudacao(): string {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  getInicial(nome: string): string {
    return nome ? nome.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(nome: string): string {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-purple-100 text-purple-700',
      'bg-rose-100 text-rose-700',
      'bg-cyan-100 text-cyan-700'
    ];
    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMADO: 'badge badge-success badge-sm font-bold',
      PENDENTE: 'badge badge-info badge-sm font-bold',
      CANCELADO: 'badge badge-error badge-sm font-bold',
      CONCLUIDO: 'badge badge-ghost badge-sm font-bold bg-slate-200',
    };
    return map[status] ?? 'badge badge-info badge-sm font-bold';
  }

  podeAtualizar(status: string): boolean {
    return status === 'PENDENTE' || status === 'CONFIRMADO';
  }
}

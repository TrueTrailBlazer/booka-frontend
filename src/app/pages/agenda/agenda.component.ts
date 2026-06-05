import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AgendamentoService } from '../../services/agendamento.service';
import { ToastService } from '../../services/toast.service';
import { Agendamento } from '../../models';

import { ModalNovoAgendamentoComponent } from '../../components/modal-novo-agendamento/modal-novo-agendamento.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, NavbarComponent, CommonModule, ModalNovoAgendamentoComponent],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
  showModalAgendamento = false;
  agendamentos: Agendamento[] = [];
  isLoading = true;
  dataSelecionada: Date = new Date();

  private agendamentoService = inject(AgendamentoService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.carregarAgendamentos();
  }

  abrirNovoAgendamento() {
    this.showModalAgendamento = true;
  }

  onAgendamentoCriado() {
    this.carregarAgendamentos();
  }

  get dataFormatada(): string {
    return this.dataSelecionada.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  get dataISO(): string {
    const y = this.dataSelecionada.getFullYear();
    const m = String(this.dataSelecionada.getMonth() + 1).padStart(2, '0');
    const d = String(this.dataSelecionada.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get isHoje(): boolean {
    const hoje = new Date();
    return (
      this.dataSelecionada.getFullYear() === hoje.getFullYear() &&
      this.dataSelecionada.getMonth() === hoje.getMonth() &&
      this.dataSelecionada.getDate() === hoje.getDate()
    );
  }

  irParaHoje() {
    this.dataSelecionada = new Date();
    this.carregarAgendamentos();
  }

  diaAnterior() {
    const d = new Date(this.dataSelecionada);
    d.setDate(d.getDate() - 1);
    this.dataSelecionada = d;
    this.carregarAgendamentos();
  }

  proximoDia() {
    const d = new Date(this.dataSelecionada);
    d.setDate(d.getDate() + 1);
    this.dataSelecionada = d;
    this.carregarAgendamentos();
  }

  carregarAgendamentos() {
    this.isLoading = true;
    this.agendamentoService.listar({ data: this.dataISO }).subscribe({
      next: (dados: Agendamento[]) => {
        this.agendamentos = dados;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  getTopPercent(inicio: string): number {
    const d = new Date(inicio);
    const horas = d.getHours() + d.getMinutes() / 60;
    const inicioGrid = 8;
    const totalHoras = 11;
    return Math.max(0, Math.min(100, ((horas - inicioGrid) / totalHoras) * 100));
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMADO: 'bg-emerald-50 border-emerald-500 text-emerald-900',
      PENDENTE: 'bg-indigo-50 border-indigo-600 text-indigo-900',
      CANCELADO: 'bg-red-50 border-red-400 text-red-800',
      CONCLUIDO: 'bg-slate-100 border-slate-400 text-slate-700',
    };
    return map[status] ?? 'bg-indigo-50 border-indigo-600 text-indigo-900';
  }
}

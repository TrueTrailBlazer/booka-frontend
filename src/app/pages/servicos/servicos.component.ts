import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ServicoService, CreateServicoRequest } from '../../services/servico.service';
import { ToastService } from '../../services/toast.service';
import { Servico } from '../../models';

interface ServicoForm {
  nome: string;
  preco: number;
  duracao: number;
  unidadeDuracao: 'minutos' | 'horas';
}

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.css'
})
export class ServicosComponent implements OnInit {
  servicos: Servico[] = [];
  isLoading = true;
  isSaving = false;
  showModal = false;
  editandoId: string | null = null;

  form: ServicoForm = {
    nome: '',
    preco: 0,
    duracao: 0,
    unidadeDuracao: 'minutos',
  };

  private servicoService = inject(ServicoService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.carregarServicos();
  }

  carregarServicos() {
    this.isLoading = true;
    this.servicoService.listar().subscribe({
      next: (dados) => {
        this.servicos = dados;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar serviços', err);
        this.isLoading = false;
        this.toastService.error('Erro ao buscar serviços.');
      }
    });
  }

  formatarDuracao(duracaoMinutos: number): string {
    if (duracaoMinutos >= 60 && duracaoMinutos % 60 === 0) {
      const h = duracaoMinutos / 60;
      return `${h}h`;
    }
    if (duracaoMinutos >= 60) {
      const h = Math.floor(duracaoMinutos / 60);
      const m = duracaoMinutos % 60;
      return `${h}h ${m}min`;
    }
    return `${duracaoMinutos} min`;
  }

  abrirModal() {
    this.editandoId = null;
    this.form = { nome: '', preco: 0, duracao: 0, unidadeDuracao: 'minutos' };
    this.showModal = true;
  }

  abrirModalEdicao(servico: Servico) {
    this.editandoId = servico.id;
    const duracaoMinutos = servico.duracaoMinutos || 0;
    // Detecta se a duração é em horas exatas
    const emHoras = duracaoMinutos >= 60 && duracaoMinutos % 60 === 0;
    this.form = {
      nome: servico.nome,
      preco: servico.preco,
      duracao: emHoras ? duracaoMinutos / 60 : duracaoMinutos,
      unidadeDuracao: emHoras ? 'horas' : 'minutos',
    };
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
    this.editandoId = null;
    this.form = { nome: '', preco: 0, duracao: 0, unidadeDuracao: 'minutos' };
  }

  get tituloModal(): string {
    return this.editandoId ? 'Editar Serviço' : 'Novo Serviço';
  }

  salvarServico() {
    if (!this.form.nome || this.form.preco === null || this.form.preco === undefined || this.form.duracao === null || this.form.duracao === undefined) {
      this.toastService.warning('Preencha todos os campos.');
      return;
    }

    if (this.form.preco <= 0) {
      this.toastService.warning('O preço deve ser maior que zero.');
      return;
    }

    if (this.form.duracao <= 0) {
      this.toastService.warning('A duração deve ser maior que zero.');
      return;
    }

    const duracaoMinutos = this.form.unidadeDuracao === 'horas'
      ? Math.round(this.form.duracao * 60)
      : Math.round(this.form.duracao);

    const payload: CreateServicoRequest = {
      nome: this.form.nome,
      preco: this.form.preco,
      duracaoMinutos,
    };

    this.isSaving = true;

    const request$ = this.editandoId
      ? this.servicoService.atualizar(this.editandoId, payload)
      : this.servicoService.criar(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.fecharModal();
        this.carregarServicos();
        this.toastService.success(this.editandoId ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!');
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toastService.error('Erro ao salvar serviço. Tente novamente.');
      }
    });
  }
}

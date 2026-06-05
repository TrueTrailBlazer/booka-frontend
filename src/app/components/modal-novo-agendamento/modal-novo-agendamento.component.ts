import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { ServicoService } from '../../services/servico.service';
import { AgendamentoService } from '../../services/agendamento.service';
import { ToastService } from '../../services/toast.service';
import { Cliente, Servico, StatusAgendamento } from '../../models';

@Component({
  selector: 'app-modal-novo-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-novo-agendamento.component.html'
})
export class ModalNovoAgendamentoComponent implements OnChanges {
  @Input() showModal = false;
  @Output() close = new EventEmitter<void>();
  @Output() agendamentoCriado = new EventEmitter<void>();

  clientes: Cliente[] = [];
  servicos: Servico[] = [];
  isCarregando = false;
  isSalvando = false;

  form = {
    clienteId: '',
    servicoId: '',
    data: '',
    hora: '',
    observacoes: ''
  };

  private clienteService = inject(ClienteService);
  private servicoService = inject(ServicoService);
  private agendamentoService = inject(AgendamentoService);
  private toastService = inject(ToastService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && changes['showModal'].currentValue === true) {
      this.carregarDados();
    }
  }

  carregarDados() {
    this.isCarregando = true;
    this.clienteService.listar().subscribe({
      next: (c) => {
        this.clientes = c;
        this.servicoService.listar().subscribe({
          next: (s) => {
            this.servicos = s;
            this.isCarregando = false;
          },
          error: (err) => {
            console.error('Erro ao carregar serviços:', err);
            this.toastService.error('Erro ao carregar serviços.');
            this.isCarregando = false;
          }
        });
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
        this.toastService.error('Erro ao carregar clientes.');
        this.isCarregando = false;
      }
    });
  }

  fechar() {
    this.showModal = false;
    this.close.emit();
    this.limparForm();
  }

  limparForm() {
    this.form = { clienteId: '', servicoId: '', data: '', hora: '', observacoes: '' };
  }

  salvar() {
    if (!this.form.clienteId || !this.form.servicoId || !this.form.data || !this.form.hora) {
      this.toastService.warning('Preencha os campos obrigatórios (Cliente, Serviço, Data e Hora).');
      return;
    }

    this.isSalvando = true;
    
    // Converter a data e hora locais para UTC (formato ISO Zod)
    const dataLocal = new Date(`${this.form.data}T${this.form.hora}:00`);
    
    const request = {
      clienteId: this.form.clienteId,
      servicoId: this.form.servicoId,
      inicio: dataLocal.toISOString(),
      observacoes: this.form.observacoes?.trim() ? this.form.observacoes.trim() : undefined,
      status: 'CONFIRMADO' as StatusAgendamento
    };

    this.agendamentoService.criar(request).subscribe({
      next: () => {
        this.toastService.success('Agendamento criado com sucesso!');
        this.agendamentoCriado.emit();
        this.isSalvando = false;
        this.fechar();
      },
      error: () => {
        this.toastService.error('Erro ao criar agendamento. Tente novamente.');
        this.isSalvando = false;
      }
    });
  }
}

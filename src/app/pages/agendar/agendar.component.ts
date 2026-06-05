import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProfissionalService } from '../../services/profissional.service';
import { AgendamentoService, CreateAgendamentoPublicoRequest } from '../../services/agendamento.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ModalService } from '../../services/modal.service';
import { ProfissionalDetalhe, ProfissionalServico } from '../../models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent, NavbarComponent],
  templateUrl: './agendar.component.html',
  styleUrl: './agendar.component.css'
})
export class AgendarComponent implements OnInit {
  lojaId: string | null = null;
  profissional: ProfissionalDetalhe | null = null;
  step = 1;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  servicoSelecionado: ProfissionalServico | null = null;
  dataSelecionada: Date | null = null;
  horarioSelecionado: string | null = null;

  clienteNome: string = '';
  clienteEmail: string = '';
  clienteWhatsapp: string = '';
  readonly apiUrl = environment.apiUrl;

  mesAtualNome: string = '';
  diasDoMes: (number | null)[] = [];
  dataAtual: Date = new Date();
  diaSelecionado: number | null = null;
  horariosDisponiveis: string[] = [];
  
  private profissionalService = inject(ProfissionalService);
  private agendamentoService = inject(AgendamentoService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.gerarCalendario(this.dataAtual);
    this.carregarProfissional();
    this.preencherDadosUsuarioLogado();
  }

  preencherDadosUsuarioLogado() {
    if (this.authService.isLoggedIn()) {
      this.authService.getMe().subscribe({
        next: (response) => {
          if (response?.user) {
            this.clienteNome = response.user.nome || '';
            this.clienteEmail = response.user.email || '';
          }
        },
        error: (err) => {
          console.error('Erro ao obter dados do usuário logado:', err);
        }
      });
    }
  }

  carregarProfissional() {
    this.route.paramMap.subscribe(params => {
      this.lojaId = params.get('idLoja');
      if (this.lojaId) {
        this.isLoading = true;
        this.profissionalService.obterPorId(this.lojaId).subscribe({
          next: (response) => {
            this.profissional = response;
            if (this.profissional?.servicos?.length > 0) {
              this.servicoSelecionado = this.profissional.servicos[0];
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erro ao carregar profissional:', err);
            this.errorMessage = 'Profissional não encontrado.';
            this.isLoading = false;
          }
        });
      }
    });
  }

  gerarCalendario(data: Date) {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.mesAtualNome = `${nomesMeses[mes]} ${ano}`;

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    this.diasDoMes = Array(primeiroDia).fill(null);
    for (let i = 1; i <= ultimoDia; i++) {
      this.diasDoMes.push(i);
    }
  }

  mudarMes(delta: number) {
     this.dataAtual.setMonth(this.dataAtual.getMonth() + delta);
     this.gerarCalendario(this.dataAtual);
     this.diaSelecionado = null;
     this.dataSelecionada = null;
     this.horarioSelecionado = null;
     this.horariosDisponiveis = [];
  }



  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isProfissional(): boolean {
    return this.authService.getRole() === 'PROFISSIONAL';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  selecionarServico(servico: ProfissionalServico) {
    this.servicoSelecionado = servico;
    // Recarrega slots com a duração do novo serviço, se já há data selecionada
    if (this.dataSelecionada) {
      this.horarioSelecionado = null;
      this.buscarHorariosDisponiveis();
    }
  }

  selecionarData(dia: number) {
    this.diaSelecionado = dia;
    this.dataSelecionada = new Date(this.dataAtual.getFullYear(), this.dataAtual.getMonth(), dia);
    this.horarioSelecionado = null;
    this.buscarHorariosDisponiveis();
  }

  private buscarHorariosDisponiveis() {
    if (!this.lojaId || !this.dataSelecionada) return;
    const ano = this.dataSelecionada.getFullYear();
    const mes = String(this.dataSelecionada.getMonth() + 1).padStart(2, '0');
    const dia = String(this.dataSelecionada.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    const servicoId = this.servicoSelecionado?.id;
    this.profissionalService.obterDisponibilidade(this.lojaId, dataFormatada, servicoId).subscribe({
      next: (response) => {
        this.horariosDisponiveis = response.slots || [];
      },
      error: (err) => {
        console.error('Erro ao carregar horários:', err);
        this.horariosDisponiveis = [];
      }
    });
  }

  selecionarHorario(hora: string) {
    this.horarioSelecionado = hora;
  }

  getImageUrl(value?: string | null): string | null {
    if (!value) return null;
    if (/^(https?:|data:|blob:)/.test(value)) return value;
    if (value.startsWith('/')) return `${this.apiUrl}${value}`;
    return value;
  }

  finalizarAgendamento() {
    if (!this.servicoSelecionado || !this.dataSelecionada || !this.horarioSelecionado) {
      this.modalService.alert("Atenção", "Selecione um serviço, uma data e um horário para continuar.");
      return;
    }

    if (!this.clienteNome || !this.clienteWhatsapp) {
      this.modalService.alert("Atenção", "Preencha seu nome e WhatsApp para continuar.");
      return;
    }

    this.isSaving = true;
    // Constrói a data usando o ano/mês/dia local (não UTC) + horário selecionado
    const ano = this.dataSelecionada.getFullYear();
    const mes = String(this.dataSelecionada.getMonth() + 1).padStart(2, '0');
    const dia = String(this.dataSelecionada.getDate()).padStart(2, '0');
    // Cria o Date com hora local e converte para ISO com offset correto
    const dataHoraLocal = new Date(`${ano}-${mes}-${dia}T${this.horarioSelecionado}:00`);
    const inicioIso = dataHoraLocal.toISOString();
    
    const dados: CreateAgendamentoPublicoRequest = {
      lojaId: this.lojaId!,
      servicoId: this.servicoSelecionado.id,
      inicio: inicioIso,
      cliente: {
        nome: this.clienteNome,
        email: this.clienteEmail || null,
        telefone: this.clienteWhatsapp,
      }
    };

    this.agendamentoService.criarPublico(dados).subscribe({
      next: () => {
        this.isSaving = false;
        const msg = `Seu agendamento foi registrado com sucesso!<br><br>Enviamos uma confirmação para seu <b>e-mail</b> e para o <b>WhatsApp</b> cadastrado.`;
        this.modalService.success('Agendamento Confirmado!', msg, 'Explorar Mais', () => {
          this.router.navigate(['/explorar']);
        });
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Erro ao criar agendamento:', err);
        this.modalService.alert('Erro', 'Erro ao confirmar agendamento. Tente novamente.');
      }
    });
  }
}

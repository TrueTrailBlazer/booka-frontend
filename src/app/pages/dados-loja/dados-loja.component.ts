import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { LojaService } from '../../services/loja.service';
import { DisponibilidadeService, UpdateDisponibilidadeItem } from '../../services/disponibilidade.service';
import { ViaCepService } from '../../services/viacep.service';
import { Loja } from '../../models';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

interface HorarioDia {
  abertura: string;
  fechamento: string;
  ativo: boolean;
}

@Component({
  selector: 'app-dados-loja',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, NavbarComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './dados-loja.component.html',
  styleUrl: './dados-loja.component.css',
})
export class DadosLojaComponent implements OnInit {
  @ViewChild('capaInput') capaInput!: ElementRef<HTMLInputElement>;

  loja: Partial<Loja> = {
    nome: '',
    telefone: '',
    endereco: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    complemento: '',
    estado: '',
    email: '',
    cidade: '',
    descricao: '',
    imagemUrl: null,
  };

  horarios: { label: string; dias: number[]; data: HorarioDia }[] = [
    { label: 'Segunda a Sexta', dias: [1, 2, 3, 4, 5], data: { abertura: '09:00', fechamento: '18:00', ativo: true } },
    { label: 'Sábado',          dias: [6],              data: { abertura: '09:00', fechamento: '14:00', ativo: true } },
    { label: 'Domingo',         dias: [0],              data: { abertura: '09:00', fechamento: '14:00', ativo: false } },
  ];

  isLoading = true;
  isSaving = false;
  isUploadingCapa = false;
  capaPreview: string | null = null;

  isBuscandoCep = false;
  cepNaoEncontrado = false;
  cepPreenchido = false;

  readonly apiUrl = environment.apiUrl;

  private lojaService = inject(LojaService);
  private disponibilidadeService = inject(DisponibilidadeService);
  private viaCepService = inject(ViaCepService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.isLoading = true;
    forkJoin({
      loja: this.lojaService.obter(),
      disponibilidade: this.disponibilidadeService.listar(),
    }).subscribe({
      next: ({ loja, disponibilidade }) => {
        this.loja = loja;
        this.cepPreenchido = !!loja.cep;

        for (const grupo of this.horarios) {
          const primeiroDia = grupo.dias[0];
          const found = disponibilidade.find((d) => d.diaSemana === primeiroDia);
          if (found) {
            grupo.data = { abertura: found.horaInicio, fechamento: found.horaFim, ativo: found.ativo };
          }
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  onCepInput(valor: string) {
    const cepLimpo = valor.replace(/\D/g, '');
    this.loja.cep = cepLimpo;
    this.cepNaoEncontrado = false;

    if (cepLimpo.length === 8) {
      this.buscarCep(cepLimpo);
    } else {
      this.cepPreenchido = false;
    }
  }

  private buscarCep(cep: string) {
    this.isBuscandoCep = true;
    this.cepPreenchido = false;
    this.viaCepService.buscarPorCep(cep).subscribe({
      next: (endereco) => {
        this.loja.logradouro = endereco.logradouro;
        this.loja.bairro = endereco.bairro;
        this.loja.cidade = endereco.cidade;
        this.loja.estado = endereco.estado;
        this.isBuscandoCep = false;
        this.cepPreenchido = true;
      },
      error: () => {
        this.isBuscandoCep = false;
        this.cepNaoEncontrado = true;
        this.cepPreenchido = false;
      },
    });
  }

  get capaSrc(): string | null {
    if (this.capaPreview) return this.capaPreview;
    if (this.loja.imagemUrl) return `${this.apiUrl}${this.loja.imagemUrl}`;
    return null;
  }

  abrirSeletorCapa() {
    this.capaInput.nativeElement.click();
  }

  onCapaSelecionada(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.toastService.warning('Apenas imagens JPEG, PNG ou WEBP são permitidas.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.toastService.warning('A imagem deve ter no máximo 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => (this.capaPreview = e.target?.result as string);
    reader.readAsDataURL(file);

    this.isUploadingCapa = true;
    this.lojaService.uploadCapa(file).subscribe({
      next: (res) => {
        this.loja.imagemUrl = res.imagemUrl;
        this.capaPreview = null;
        this.isUploadingCapa = false;
      },
      error: (err) => {
        console.error(err);
        this.capaPreview = null;
        this.isUploadingCapa = false;
        this.toastService.error('Erro ao enviar a imagem. Tente novamente.');
      },
    });
  }

  salvarDados() {
    this.isSaving = true;

    const disponibilidadeItems: UpdateDisponibilidadeItem[] = [];
    for (const grupo of this.horarios) {
      for (const dia of grupo.dias) {
        disponibilidadeItems.push({
          diaSemana: dia,
          horaInicio: grupo.data.ativo ? grupo.data.abertura : '00:00',
          horaFim: grupo.data.ativo ? grupo.data.fechamento : '00:00',
          intervaloMinutos: 30,
          ativo: grupo.data.ativo,
        });
      }
    }

    forkJoin({
      loja: this.lojaService.atualizar(this.loja),
      disponibilidade: this.disponibilidadeService.atualizar(disponibilidadeItems),
    }).subscribe({
      next: ({ loja }) => {
        this.loja = loja;
        this.isSaving = false;
        this.toastService.success('Dados salvos com sucesso!');
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.toastService.error('Erro ao salvar dados.');
      },
    });
  }
}

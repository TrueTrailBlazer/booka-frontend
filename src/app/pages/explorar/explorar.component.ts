import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { ProfissionalService } from '../../services/profissional.service';
import { Profissional } from '../../models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FooterComponent, NavbarComponent],
  templateUrl: './explorar.component.html'
})
export class ExplorarComponent implements OnInit {
  termoBusca = '';
  cidadeBusca = '';

  precomax = 500;
  avaliacaoMinima = 0;
  modalidade = 'todas';

  categorias: { [key: string]: boolean } = {
    Consultoria: false,
    Educação: false,
    Beleza: false,
    'Bem-Estar e Saúde': false,
    Casa: false,
  };

  tiposVendedor: { [key: string]: boolean } = {
    Autônomo: true,
    Empresa: true,
  };

  profissionais: Profissional[] = [];
  isLoading = true;
  errorMessage = '';
  readonly apiUrl = environment.apiUrl;

  private profissionalService = inject(ProfissionalService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  get profissionaisFiltrados() {
    return this.profissionais.filter((profissional) => {
      const normalizar = (str: string) =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      const termo = normalizar(this.termoBusca);
      const bateTermo =
        !termo ||
        normalizar(profissional.nome || '').includes(termo) ||
        normalizar(profissional.profissao || '').includes(termo);

      const cidade = normalizar(this.cidadeBusca);
      const bateCidade = !cidade || normalizar(profissional.cidade || '').includes(cidade);

      const batePreco = profissional.precoInicial <= this.precomax;
      const bateAvaliacao = profissional.rating >= this.avaliacaoMinima;
      const bateModalidade =
        this.modalidade === 'todas' || profissional.modalidade === this.modalidade.toUpperCase();

      const categoriasAtivas = Object.keys(this.categorias).filter((key) => this.categorias[key]);
      const bateCategoria =
        categoriasAtivas.length === 0 || categoriasAtivas.includes(profissional.categoria || '');

      const vendedorDisplay = profissional.vendedor === 'AUTONOMO' ? 'Autônomo' : 'Empresa';
      const bateVendedor = this.tiposVendedor[vendedorDisplay];

      return (
        bateTermo &&
        bateCidade &&
        batePreco &&
        bateAvaliacao &&
        bateModalidade &&
        bateCategoria &&
        bateVendedor
      );
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isProfissional(): boolean {
    return this.authService.getRole() === 'PROFISSIONAL';
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.termoBusca = params['q'] || '';
      this.cidadeBusca = params['local'] || '';
      this.carregarProfissionais();
    });
  }

  onFilterChange() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setAvaliacao(val: number) {
    this.avaliacaoMinima = this.avaliacaoMinima === val ? 0 : val;
    this.onFilterChange();
  }

  setModalidade(val: string) {
    this.modalidade = this.modalidade === val ? 'todas' : val;
    this.onFilterChange();
  }

  limparFiltros() {
    this.termoBusca = '';
    this.cidadeBusca = '';
    this.precomax = 500;
    this.avaliacaoMinima = 0;
    this.modalidade = 'todas';
    Object.keys(this.categorias).forEach((key) => (this.categorias[key] = false));
    Object.keys(this.tiposVendedor).forEach((key) => (this.tiposVendedor[key] = true));
    this.router.navigate(['/explorar'], { replaceUrl: true });
    this.carregarProfissionais();
    this.onFilterChange();
  }

  getImageUrl(value?: string | null): string | null {
    if (!value) return null;
    if (/^(https?:|data:|blob:)/.test(value)) return value;
    if (value.startsWith('/')) return `${this.apiUrl}${value}`;
    return value;
  }

  logout() {
    this.modalService.confirm(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      () => {
        this.authService.logout();
        this.router.navigate(['/']);
      },
      'Sair'
    );
  }

  carregarProfissionais() {
    this.isLoading = true;
    this.errorMessage = '';
    const params: any = {};
    if (this.cidadeBusca) params.cidade = this.cidadeBusca;
    if (this.termoBusca) params.q = this.termoBusca;

    this.profissionalService.listar(params).subscribe({
      next: (response) => {
        this.profissionais = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar profissionais:', err);
        this.errorMessage = 'Erro ao carregar profissionais. Tente novamente.';
        this.profissionais = [];
        this.isLoading = false;
      }
    });
  }
}

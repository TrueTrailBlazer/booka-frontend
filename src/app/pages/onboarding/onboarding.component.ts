import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OnboardingService, FinalizeOnboardingRequest } from '../../services/onboarding.service';
import { ViaCepService } from '../../services/viacep.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent {
  step: number = 1;
  isLoading = false;
  errorMessage = '';

  selectedCategory: string = '';
  categoryName: string = '';
  categoryArticle: string = 'sua';

  storeName: string = '';
  storePhone: string = '';
  storeProfissao: string = '';
  storeModalidade: 'ONLINE' | 'PRESENCIAL' | 'HIBRIDO' = 'PRESENCIAL';
  storeTipoVendedor: 'AUTONOMO' | 'EMPRESA' = 'AUTONOMO';

  // Campos de endereço separados
  storeCep: string = '';
  storeLogradouro: string = '';
  storeNumero: string = '';
  storeBairro: string = '';
  storeComplemento: string = '';
  storeEstado: string = '';
  storeCidade: string = '';

  isBuscandoCep = false;
  cepNaoEncontrado = false;
  cepPreenchido = false;

  private router = inject(Router);
  private onboardingService = inject(OnboardingService);
  private viaCepService = inject(ViaCepService);

  selectCategory(id: string, name: string, article: string) {
    this.selectedCategory = id;
    this.categoryName = name;
    this.categoryArticle = article;
  }

  onCepInput(valor: string) {
    const cepLimpo = valor.replace(/\D/g, '');
    this.storeCep = cepLimpo;
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
        this.storeLogradouro = endereco.logradouro;
        this.storeBairro = endereco.bairro;
        this.storeCidade = endereco.cidade;
        this.storeEstado = endereco.estado;
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

  get enderecoValido(): boolean {
    return (
      this.storeCep.length === 8 &&
      this.storeLogradouro.trim().length >= 2 &&
      this.storeNumero.trim().length >= 1 &&
      this.storeBairro.trim().length >= 2 &&
      this.storeCidade.trim().length >= 2 &&
      this.storeEstado.trim().length === 2
    );
  }

  nextStep() {
    if (this.step === 1 && this.selectedCategory) {
      this.step = 2;
    } else if (this.step === 2 && this.storeName && this.storePhone) {
      this.step = 3;
    } else if (this.step === 3 && this.enderecoValido) {
      this.finalizarOnboarding();
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  private finalizarOnboarding() {
    this.isLoading = true;
    this.errorMessage = '';

    const dados: FinalizeOnboardingRequest = {
      nome: this.storeName,
      telefone: this.storePhone,
      cep: this.storeCep,
      logradouro: this.storeLogradouro,
      numero: this.storeNumero,
      bairro: this.storeBairro,
      complemento: this.storeComplemento || undefined,
      estado: this.storeEstado,
      cidade: this.storeCidade,
      profissao: this.storeProfissao || this.categoryName || 'Profissional',
      categoriaPrincipal: this.selectedCategory,
      modalidadePrincipal: this.storeModalidade,
      tipoVendedor: this.storeTipoVendedor,
    };

    this.onboardingService.finalizar(dados).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro ao finalizar onboarding:', err);
        this.errorMessage = 'Erro ao salvar dados. Tente novamente.';
      },
    });
  }
}

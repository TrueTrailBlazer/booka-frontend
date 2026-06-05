import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { MeResponse } from '../../models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, NavbarComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isLoading = true;
  isSavingPerfil = false;
  isSavingSenha = false;
  isUploadingAvatar = false;

  usuario = { nome: '', email: '', iniciais: '', imagemUrl: null as string | null };
  senha = { senhaAtual: '', novaSenha: '', confirmarSenha: '' };
  avatarPreview: string | null = null;

  readonly apiUrl = environment.apiUrl;

  ngOnInit() {
    this.carregarPerfil();
  }

  carregarPerfil() {
    this.isLoading = true;
    this.authService.getMe().subscribe({
      next: (dados: MeResponse) => {
        this.usuario = {
          nome: dados.user.nome,
          email: dados.user.email,
          iniciais: this.gerarIniciais(dados.user.nome),
          imagemUrl: dados.user.imagemUrl ?? null,
        };
        this.avatarPreview = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.isLoading = false;
      },
    });
  }

  get isProfissional(): boolean {
    return this.authService.getRole() === 'PROFISSIONAL';
  }

  get avatarSrc(): string | null {
    if (this.avatarPreview) return this.avatarPreview;
    if (this.usuario.imagemUrl) return `${this.apiUrl}${this.usuario.imagemUrl}`;
    return null;
  }

  abrirSeletorArquivo() {
    this.fileInput.nativeElement.click();
  }

  onArquivoSelecionado(event: Event) {
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
    reader.onload = (e) => (this.avatarPreview = e.target?.result as string);
    reader.readAsDataURL(file);

    this.isUploadingAvatar = true;
    this.authService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.usuario.imagemUrl = res.imagemUrl;
        this.isUploadingAvatar = false;
      },
      error: (err) => {
        console.error(err);
        this.avatarPreview = null;
        this.isUploadingAvatar = false;
        this.toastService.error('Erro ao enviar a imagem. Tente novamente.');
      },
    });
  }

  isSavingAll = false;

  salvarTudo() {
    let tentarSenha = !!(this.senha.senhaAtual || this.senha.novaSenha);
    
    if (tentarSenha) {
      if (!this.senha.senhaAtual || !this.senha.novaSenha) {
        this.toastService.warning('Para alterar a senha, preencha a senha atual e a nova senha.');
        return;
      }
      if (this.senha.novaSenha !== this.senha.confirmarSenha) {
        this.toastService.warning('A nova senha e a confirmação não coincidem.');
        return;
      }
      if (this.senha.novaSenha.length < 8) {
        this.toastService.warning('A nova senha deve ter pelo menos 8 caracteres.');
        return;
      }
    }

    this.isSavingAll = true;
    
    this.authService.updateMe({ nome: this.usuario.nome, email: this.usuario.email }).subscribe({
      next: (result) => {
        this.usuario.iniciais = this.gerarIniciais(result.nome);
        
        if (tentarSenha) {
          this.authService.updateSenha(this.senha.senhaAtual, this.senha.novaSenha).subscribe({
            next: () => {
              this.senha = { senhaAtual: '', novaSenha: '', confirmarSenha: '' };
              this.isSavingAll = false;
              this.toastService.success('Perfil e senha alterados com sucesso!');
            },
            error: (err: any) => {
              console.error(err);
              const msg = err?.error?.message || 'Erro ao alterar senha.';
              this.toastService.error('Perfil salvo, mas ocorreu erro na senha: ' + msg);
              this.isSavingAll = false;
            }
          });
        } else {
          this.isSavingAll = false;
          this.toastService.success('Dados pessoais salvos com sucesso!');
        }
      },
      error: (err: any) => {
        console.error(err);
        const msg = err?.error?.message || 'Erro ao salvar dados pessoais.';
        this.toastService.error(msg);
        this.isSavingAll = false;
      }
    });
  }

  cancelar() {
    this.carregarPerfil();
    this.senha = { senhaAtual: '', novaSenha: '', confirmarSenha: '' };
  }

  private gerarIniciais(nome: string): string {
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }
}

import { Component, inject, OnInit, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  ngOnInit() {
    this.initializeGoogleLogin();
    // Pequeno delay para garantir que o DOM renderizou o container
    setTimeout(() => this.renderGoogleButton(), 100);
  }

  private initializeGoogleLogin() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleLogin(response)
      });
    }
  }

  handleGoogleLogin(response: any) {
    if (response.credential) {
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.redirectAfterLogin();
          });
        },
        error: (err) => {
          console.error('Erro Google Login:', err);
          alert('Falha na autenticação com Google.');
        }
      });
    }
  }

  private redirectAfterLogin() {
    const role = this.authService.getRole();
    if (role === 'PROFISSIONAL') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/explorar']);
    }
  }

  loginWithGoogle() {
    // Este método pode ser removido pois o botão oficial será renderizado e lidará com o clique
    if (typeof google !== 'undefined') {
      google.accounts.id.prompt(); 
    }
  }

  private renderGoogleButton() {
    const container = document.getElementById('google-btn-container');
    if (container && typeof google !== 'undefined') {
      google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: container.offsetWidth > 0 ? container.offsetWidth : 200
      });
    } else {
      // Se o google ainda não carregou, tenta novamente em 500ms
      setTimeout(() => this.renderGoogleButton(), 500);
    }
  }

  onSubmit() {
    if (!this.email || !this.password) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    // Interceptar login de teste
    if (this.email === 'cliente@booka.com' && this.password === 'teste123') {
      this.loginTeste('CLIENTE');
      return;
    }
    if (this.email === 'profissional@booka.com' && this.password === 'teste123') {
      this.loginTeste('PROFISSIONAL');
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: () => this.redirectAfterLogin(),
      error: (err) => {
        alert('Erro ao fazer login. Verifique suas credenciais.');
        console.error(err);
      }
    });
  }

  loginTeste(tipo: 'CLIENTE' | 'PROFISSIONAL') {
    this.authService.loginTeste(tipo);
    this.redirectAfterLogin();
  }
}
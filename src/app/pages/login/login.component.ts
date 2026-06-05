import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos!';
      return;
    }

    this.isLoading = true;
    this.authService.login(this.email, this.password).pipe(
      switchMap(() => this.authService.getMe())
    ).subscribe({
      next: (meResponse) => {
        this.isLoading = false;
        const role = meResponse.user.role;
        
        if (role === 'PROFISSIONAL') {
          // Verificar se onboarding foi concluído
          if (meResponse.loja && !meResponse.loja.onboardingConcluido) {
            this.router.navigate(['/onboarding']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.router.navigate(['/explorar']);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Erro ao fazer login:', err);
        this.errorMessage = 'Email ou senha incorretos. Tente novamente.';
      }
    });
  }

}
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service';
import { CustomValidators } from '../../utils/validators';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  
  showRequirements = false;
  role: 'CLIENTE' | 'PROFISSIONAL' = 'CLIENTE';

  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Quando clica no campo
  onPasswordFocus() {
    this.showRequirements = true;
  }

  // Quando sai do campo (com um pequeno atraso pra dar tempo de clicar no olhinho sem sumir)
  onPasswordBlur() {
    setTimeout(() => {
      this.showRequirements = false;
    }, 150);
  }

  get hasMinLength() {
    return this.password.length >= 8;
  }

  get hasNumber() {
    return /[0-9]/.test(this.password);
  }
  
  get hasUpperCase() {
    return /[A-Z]/.test(this.password);
  }
  
  get hasLowerCase() {
    return /[a-z]/.test(this.password);
  }

  get hasSpecialChar() {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
  }

  get passwordsMatch() {
    return this.password === this.confirmPassword && this.password.length > 0;
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage = 'Preencha os campos obrigatórios!';
      return;
    }
    
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'E-mail inválido. Use um formato válido (ex: user@domain.com)';
      return;
    }
    
    if (!this.passwordsMatch || !this.hasMinLength) {
      this.errorMessage = 'Verifique os requisitos da senha!';
      return;
    }
    if (!this.hasNumber || !this.hasUpperCase || !this.hasLowerCase) {
      this.errorMessage = 'A senha não atende os requisitos de segurança';
      return;
    }

    this.isLoading = true;
    this.authService.register(this.fullName, this.email, this.password, this.role).subscribe({
      next: () => {
        this.isLoading = false;
        if (this.role === 'PROFISSIONAL') {
          this.router.navigate(['/onboarding']);
        } else {
          this.router.navigate(['/explorar']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro ao realizar cadastro:', err);
        if (err?.status === 409) {
          this.modalService.alert(
            'E-mail já cadastrado',
            'Já existe uma conta usando este e-mail. Entre com sua senha ou use outro endereço para criar uma nova conta.',
            'Entendi'
          );
          return;
        }

        this.errorMessage = 'Erro ao realizar cadastro. Verifique os dados e tente novamente.';
      }
    });
  }
  
  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="navbar bg-base-100 shadow-sm border-b border-base-200 fixed top-0 left-0 w-full z-[100] px-4 md:px-8 h-20">
      <div class="navbar-start">
        <a routerLink="/" class="btn btn-ghost text-xl text-primary flex gap-2">
            <svg class="w-8 h-8" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="64" rx="18" width="64"></rect>
                <g transform="translate(8, 8)">
                    <path clip-rule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="#FFFFFF" fill-rule="evenodd"></path>
                </g>
            </svg>
            <span class="font-black tracking-tighter">Booka</span>
        </a>
      </div>
      
      <div class="navbar-center hidden lg:flex">
        <div class="flex items-center gap-2 text-slate-500 font-medium text-sm">
          <a [routerLink]="['/explorar']" routerLinkActive="text-primary bg-primary/10 font-semibold" class="px-4 py-2 rounded-lg hover:text-primary transition-colors">Explorar</a>
          
          <ng-container *ngIf="isLoggedIn && isProfissional">
            <a [routerLink]="['/dashboard']" routerLinkActive="text-primary bg-primary/10 font-semibold" class="px-4 py-2 rounded-lg hover:text-primary transition-colors">Meu Painel</a>
            <a [routerLink]="['/agenda']" routerLinkActive="text-primary bg-primary/10 font-semibold" class="px-4 py-2 rounded-lg hover:text-primary transition-colors">Minha Agenda</a>
          </ng-container>
          
          <ng-container *ngIf="isLoggedIn && !isProfissional">
             <a [routerLink]="['/meus-agendamentos']" routerLinkActive="text-primary bg-primary/10 font-semibold" class="px-4 py-2 rounded-lg hover:text-primary transition-colors">Minhas Reservas</a>
          </ng-container>
          
          <ng-container *ngIf="!isLoggedIn">
             <a [routerLink]="['/cadastro']" class="px-4 py-2 rounded-lg hover:text-primary transition-colors">Cadastre seu Negócio</a>
          </ng-container>
        </div>
      </div>
      
      <div class="navbar-end gap-2">
        <ng-container *ngIf="!isLoggedIn">
            <a [routerLink]="['/login']" class="btn btn-ghost">Entrar</a>
            <a [routerLink]="['/cadastro']" class="btn btn-primary rounded-full px-6">Cadastrar</a>
        </ng-container>
        
        <ng-container *ngIf="isLoggedIn">
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost rounded-full flex gap-2 border border-base-300">
                <span class="material-symbols-outlined">person</span> Meu Perfil
              </div>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[110] mt-3 w-56 p-2 shadow-xl border border-base-200">
                <li>
                  <a [routerLink]="isProfissional ? ['/dashboard'] : ['/meus-agendamentos']">
                    <span class="material-symbols-outlined text-lg">{{ isProfissional ? 'dashboard' : 'calendar_today' }}</span>
                    {{ isProfissional ? 'Painel de Controle' : 'Minhas Reservas' }}
                  </a>
                </li>
                <li>
                  <a [routerLink]="isProfissional ? ['/configuracoes'] : ['/perfil']">
                    <span class="material-symbols-outlined text-lg">settings</span>
                    Configurações
                  </a>
                </li>
                <li>
                  <a class="justify-between">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-lg">notifications</span>
                      Notificações
                    </div>
                    <span class="badge badge-error badge-sm text-white">0</span>
                  </a>
                </li>
                <div class="divider my-0"></div>
                <li>
                  <a (click)="logout()" class="text-error hover:bg-error hover:text-white">
                    <span class="material-symbols-outlined text-lg">logout</span>
                    Sair da Conta
                  </a>
                </li>
              </ul>
            </div>
        </ng-container>
      </div>
    </div>
  `
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isProfissional(): boolean {
    return this.authService.getRole() === 'PROFISSIONAL';
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
}

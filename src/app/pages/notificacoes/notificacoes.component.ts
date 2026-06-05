import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, NavbarComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './notificacoes.component.html',
  styleUrl: './notificacoes.component.css',
})
export class NotificacoesComponent {
  canais = {
    sms: true,
    email: true,
    whatsapp: false,
  };

  saved = false;

  salvar() {
    this.saved = true;
    setTimeout(() => (this.saved = false), 3000);
  }

  cancelar() {
    this.canais = { sms: true, email: true, whatsapp: false };
  }
}

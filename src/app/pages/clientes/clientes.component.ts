import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ClienteService, CreateClienteRequest } from '../../services/cliente.service';
import { ToastService } from '../../services/toast.service';
import { Cliente } from '../../models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  isLoading = true;
  isSaving = false;
  showModal = false;

  novoCliente: CreateClienteRequest = {
    nome: '',
    email: '',
    telefone: ''
  };

  private clienteService = inject(ClienteService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.isLoading = true;
    this.clienteService.listar().subscribe({
      next: (dados) => {
        this.clientes = dados;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar clientes', err);
        this.isLoading = false;
        this.toastService.error('Erro ao buscar clientes.');
      }
    });
  }

  abrirModal() {
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
    this.novoCliente = { nome: '', email: '', telefone: '' };
  }

  salvarCliente() {
    if (!this.novoCliente.nome || !this.novoCliente.telefone) {
      this.toastService.warning('Preencha os campos obrigatórios (Nome e Telefone).');
      return;
    }

    this.isSaving = true;
    this.clienteService.criar(this.novoCliente).subscribe({
      next: () => {
        this.isSaving = false;
        this.fecharModal();
        this.carregarClientes();
        this.toastService.success('Cliente cadastrado com sucesso!');
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toastService.error('Erro ao salvar cliente. Tente novamente.');
      }
    });
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AgendamentoService } from '../../services/agendamento.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { Agendamento } from '../../models';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
    selector: 'app-meus-agendamentos',
    standalone: true,
    imports: [CommonModule, RouterModule, NavbarComponent],
    templateUrl: './meus-agendamentos.component.html'
})
export class MeusAgendamentosComponent implements OnInit {
    private agendamentoService = inject(AgendamentoService);
    private authService = inject(AuthService);
    private modalService = inject(ModalService);
    private router = inject(Router);

    agendamentos: Agendamento[] = [];
    loading = true;
    error = false;
    cancelandoId: string | null = null;



    ngOnInit() {
        this.carregarAgendamentos();
    }

    carregarAgendamentos() {
        this.loading = true;
        this.error = false;
        this.agendamentoService.getMeusAgendamentos().subscribe({
            next: (res) => {
                this.agendamentos = res;
                this.loading = false;
            },
            error: (err) => {
                console.error('Erro ao carregar agendamentos:', err);
                this.error = true;
                this.loading = false;
            }
        });
    }

    isFuturo(data: string | Date): boolean {
        const dataAgendamento = new Date(data);
        const agora = new Date();
        return dataAgendamento > agora;
    }

    cancelar(id: string | undefined) {
        if (!id) return;

        this.modalService.confirm(
            'Cancelar Agendamento',
            'Deseja realmente cancelar este agendamento?',
            () => {
                this.cancelandoId = id;
                this.agendamentoService.cancelar(id).subscribe({
                    next: () => {
                        const item = this.agendamentos.find(a => a.id === id);
                        if (item) item.status = 'CANCELADO';
                        this.cancelandoId = null;
                    },
                    error: (err) => {
                        console.error('Erro ao cancelar:', err);
                        alert('Não foi possível cancelar o agendamento no momento.');
                        this.cancelandoId = null;
                    }
                });
            },
            'Sim, Cancelar',
            'Voltar'
        );
    }
}
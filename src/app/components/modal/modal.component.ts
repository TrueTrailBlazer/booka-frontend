import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Usa a estrutura oficial da DaisyUI -->
    <dialog class="modal modal-bottom sm:modal-middle" [class.modal-open]="modalService.state().isOpen">
      <div class="modal-box p-6 md:p-8 rounded-3xl relative">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" (click)="handleBackdropClick()">✕</button>

        <div class="flex flex-col items-center">
          <div class="mb-4">
            <div *ngIf="modalService.state().type === 'alert'" class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">info</span>
            </div>
            <div *ngIf="modalService.state().type === 'confirm'" class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">help</span>
            </div>
            <div *ngIf="modalService.state().type === 'success'" class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
              <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            </div>
          </div>

          <h3 class="font-black text-2xl tracking-tight text-slate-900 mb-2">{{ modalService.state().title }}</h3>
          <p class="py-2 text-center text-slate-500 font-medium" [innerHTML]="modalService.state().message"></p>
        </div>

        <div class="modal-action mt-8 flex flex-col-reverse sm:flex-row gap-3">
          <button 
            *ngIf="modalService.state().type === 'confirm'"
            (click)="modalService.handleCancel()"
            class="btn btn-ghost font-bold rounded-2xl text-slate-500 w-full sm:w-auto">
            {{ modalService.state().cancelText }}
          </button>
          
          <button 
            (click)="modalService.handleConfirm()"
            [ngClass]="modalService.state().type === 'alert' ? 'w-full btn-primary' : 'btn-primary w-full sm:w-auto'"
            class="btn rounded-2xl font-black shadow-md">
            {{ modalService.state().confirmText }}
          </button>
        </div>
      </div>
      
      <form method="dialog" class="modal-backdrop bg-slate-900/40 backdrop-blur-sm">
        <button (click)="handleBackdropClick()" class="cursor-default">fechar</button>
      </form>
    </dialog>
  `
})
export class ModalComponent {
  modalService = inject(ModalService);

  handleBackdropClick() {
    if (this.modalService.state().type === 'alert') {
      this.modalService.handleConfirm();
    } else {
      this.modalService.handleCancel();
    }
  }
}

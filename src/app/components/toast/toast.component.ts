import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast toast-bottom toast-end z-[9999] pb-4 pr-4 sm:pb-8 sm:pr-8">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="alert shadow-lg mb-2 animate-in slide-in-from-right-8 fade-in duration-300 rounded-2xl border-none"
             [ngClass]="{
               'bg-emerald-500 text-white': toast.type === 'success',
               'bg-red-500 text-white': toast.type === 'error',
               'bg-blue-500 text-white': toast.type === 'info',
               'bg-amber-500 text-white': toast.type === 'warning'
             }">
             
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined shrink-0 text-white" style="font-variation-settings: 'FILL' 1;">
              {{ getIcon(toast.type) }}
            </span>
            <div class="flex-1 font-bold text-sm leading-tight mt-0.5 text-white">{{ toast.message }}</div>
            <button class="btn btn-ghost btn-sm btn-circle text-white/70 hover:text-white shrink-0 -mt-1 -mr-2" (click)="toastService.remove(toast.id)">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'info': return 'info';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
}

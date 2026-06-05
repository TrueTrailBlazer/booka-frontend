import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private idCounter = 0;

  show(message: string, type: ToastType = 'info', durationMs: number = 4000) {
    const id = this.idCounter++;
    const newToast: Toast = { id, message, type };
    
    this.toasts.update(current => [...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  success(message: string, durationMs?: number) {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs?: number) {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs?: number) {
    this.show(message, 'info', durationMs);
  }

  warning(message: string, durationMs?: number) {
    this.show(message, 'warning', durationMs);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}

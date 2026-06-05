export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'CLIENTE' | 'PROFISSIONAL';
  imagemUrl?: string | null;
}

export interface LojaContext {
  id: string;
  nome: string;
  onboardingConcluido: boolean;
}

export interface MeResponse {
  user: Usuario;
  loja: LojaContext | null;
}

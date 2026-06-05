export interface Cliente {
  id: string;
  nome: string;
  email?: string | null;
  telefone: string;
  anotacoes?: string | null;
  createdAt: string;
  updatedAt: string;
}

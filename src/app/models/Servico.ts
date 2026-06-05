export interface Servico {
  id: string;
  nome: string;
  descricao?: string | null;
  duracaoMinutos: number;
  preco: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

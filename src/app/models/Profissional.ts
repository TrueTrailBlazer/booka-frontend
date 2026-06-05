export interface Profissional {
  id: string;
  nome: string;
  profissao: string;
  categoria: string;
  modalidade: 'ONLINE' | 'PRESENCIAL' | 'HIBRIDO';
  vendedor: 'AUTONOMO' | 'EMPRESA';
  cidade?: string | null;
  avatarUrl?: string | null;
  capaUrl?: string | null;
  img?: string | null;
  precoInicial: number;
  rating: number;
}

export interface ProfissionalDetalhe {
  id: string;
  nome: string;
  profissao: string;
  descricao?: string | null;
  telefone?: string | null;
  cidade?: string | null;
  avatarUrl?: string | null;
  capaUrl?: string | null;
  img?: string | null;
  rating: number;
  servicos: ProfissionalServico[];
}

export interface ProfissionalServico {
  id: string;
  nome: string;
  descricao?: string | null;
  preco: number;
  duracaoMinutos: number;
}

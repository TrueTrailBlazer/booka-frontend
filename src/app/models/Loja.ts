export interface Loja {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  complemento?: string | null;
  estado?: string | null;
  cidade?: string | null;
  descricao?: string | null;
  imagemUrl?: string | null;
  onboardingConcluido: boolean;
  profissao?: string | null;
  categoriaPrincipal?: string | null;
  modalidadePrincipal?: 'ONLINE' | 'PRESENCIAL' | 'HIBRIDO' | null;
  tipoVendedor?: 'AUTONOMO' | 'EMPRESA' | null;
}

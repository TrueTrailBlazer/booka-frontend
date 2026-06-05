// src/app/models/Agendamento.ts
export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';
export type OrigemAgendamento = 'PUBLICO' | 'PAINEL';

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  servicoId: string;
  servicoNome: string;
  inicio: string;
  fim: string;
  status: StatusAgendamento;
  origem?: OrigemAgendamento;
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
  nomeLoja?: string;
  nomeServico?: string;
  data?: string;
  valor?: number;
}
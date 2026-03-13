// Tipos do banco de dados Vivaz Barbearia
// Para gerar automaticamente: npx supabase gen types typescript --project-id okmuhustvzkbwxsfemxn > src/types/database.types.ts

export type UserRole = 'cliente' | 'barbeiro' | 'admin';
export type AgendamentoStatus = 'agendado' | 'confirmado' | 'em atendimento' | 'finalizado' | 'cancelado' | 'faltou';

export interface Database {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string;
          nome: string | null;
          telefone: string | null;
          role: UserRole | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nome?: string | null;
          telefone?: string | null;
          role?: UserRole | null;
          avatar_url?: string | null;
        };
        Update: {
          nome?: string | null;
          telefone?: string | null;
          role?: UserRole | null;
          avatar_url?: string | null;
        };
      };
      clientes: {
        Row: {
          id: string;
          nome: string | null;
          telefone: string | null;
          email: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome?: string | null;
          telefone?: string | null;
          email?: string | null;
          user_id?: string | null;
        };
        Update: {
          nome?: string | null;
          telefone?: string | null;
          email?: string | null;
          user_id?: string | null;
        };
      };
      barbeiros: {
        Row: {
          id: string;
          nome: string | null;
          foto: string | null;
          telefone: string | null;
          especialidade: string | null;
          comissao: number | null;
          ativo: boolean;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome?: string | null;
          foto?: string | null;
          telefone?: string | null;
          especialidade?: string | null;
          comissao?: number | null;
          ativo?: boolean;
          user_id?: string | null;
        };
        Update: {
          nome?: string | null;
          foto?: string | null;
          telefone?: string | null;
          especialidade?: string | null;
          comissao?: number | null;
          ativo?: boolean;
          user_id?: string | null;
        };
      };
      horarios_barbeiro: {
        Row: {
          id: string;
          barbeiro_id: string;
          dia_semana: number;
          inicio: string;
          fim: string;
        };
        Insert: {
          id?: string;
          barbeiro_id: string;
          dia_semana: number;
          inicio: string;
          fim: string;
        };
        Update: {
          barbeiro_id?: string;
          dia_semana?: number;
          inicio?: string;
          fim?: string;
        };
      };
      bloqueios_barbeiro: {
        Row: {
          id: string;
          barbeiro_id: string;
          data: string;
          motivo: string | null;
        };
        Insert: {
          id?: string;
          barbeiro_id: string;
          data: string;
          motivo?: string | null;
        };
        Update: {
          barbeiro_id?: string;
          data?: string;
          motivo?: string | null;
        };
      };
      categorias_servico: {
        Row: {
          id: string;
          nome: string | null;
          ordem: number | null;
        };
        Insert: {
          id?: string;
          nome?: string | null;
          ordem?: number | null;
        };
        Update: {
          nome?: string | null;
          ordem?: number | null;
        };
      };
      servicos: {
        Row: {
          id: string;
          nome: string | null;
          descricao: string | null;
          preco: number | null;
          duracao_minutos: number | null;
          categoria_id: string | null;
          foto: string | null;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome?: string | null;
          descricao?: string | null;
          preco?: number | null;
          duracao_minutos?: number | null;
          categoria_id?: string | null;
          foto?: string | null;
          ativo?: boolean;
        };
        Update: {
          nome?: string | null;
          descricao?: string | null;
          preco?: number | null;
          duracao_minutos?: number | null;
          categoria_id?: string | null;
          foto?: string | null;
          ativo?: boolean;
        };
      };
      agendamentos: {
        Row: {
          id: string;
          cliente_id: string;
          barbeiro_id: string;
          servico_id: string;
          data: string;
          hora: string;
          status: AgendamentoStatus;
          observacao: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          barbeiro_id: string;
          servico_id: string;
          data: string;
          hora: string;
          status?: AgendamentoStatus;
          observacao?: string | null;
        };
        Update: {
          cliente_id?: string;
          barbeiro_id?: string;
          servico_id?: string;
          data?: string;
          hora?: string;
          status?: AgendamentoStatus;
          observacao?: string | null;
        };
      };
      avaliacoes: {
        Row: {
          id: string;
          agendamento_id: string;
          cliente_id: string;
          barbeiro_id: string;
          nota: number;
          comentario: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agendamento_id: string;
          cliente_id: string;
          barbeiro_id: string;
          nota: number;
          comentario?: string | null;
        };
        Update: {
          nota?: number;
          comentario?: string | null;
        };
      };
    };
  };
}

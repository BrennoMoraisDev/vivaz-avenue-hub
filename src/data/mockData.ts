// Mock data for development - will be replaced by Supabase queries

export const mockCategorias = [
  { id: 'cat-1', nome: 'Cortes', ordem: 1 },
  { id: 'cat-2', nome: 'Barba', ordem: 2 },
  { id: 'cat-3', nome: 'Tratamentos Capilares', ordem: 3 },
  { id: 'cat-4', nome: 'Combos', ordem: 4 },
];

export const mockServicos = [
  { id: 'srv-1', nome: 'Corte Social', descricao: 'Corte clássico com acabamento na máquina e tesoura', preco: 45, duracao_minutos: 30, categoria_id: 'cat-1', foto: null, ativo: true, created_at: '' },
  { id: 'srv-2', nome: 'Corte Degradê', descricao: 'Degradê moderno com navalhado e finalização premium', preco: 55, duracao_minutos: 40, categoria_id: 'cat-1', foto: null, ativo: true, created_at: '' },
  { id: 'srv-3', nome: 'Corte Premium', descricao: 'Corte personalizado com lavagem e hidratação', preco: 70, duracao_minutos: 50, categoria_id: 'cat-1', foto: null, ativo: true, created_at: '' },
  { id: 'srv-4', nome: 'Barba Completa', descricao: 'Barba modelada com toalha quente e pós-barba', preco: 40, duracao_minutos: 30, categoria_id: 'cat-2', foto: null, ativo: true, created_at: '' },
  { id: 'srv-5', nome: 'Barba Design', descricao: 'Design de barba com navalha e acabamento detalhado', preco: 50, duracao_minutos: 35, categoria_id: 'cat-2', foto: null, ativo: true, created_at: '' },
  { id: 'srv-6', nome: 'Hidratação Capilar', descricao: 'Tratamento profundo com produtos premium', preco: 60, duracao_minutos: 40, categoria_id: 'cat-3', foto: null, ativo: true, created_at: '' },
  { id: 'srv-7', nome: 'Selagem Capilar', descricao: 'Selagem para redução de volume e brilho intenso', preco: 120, duracao_minutos: 90, categoria_id: 'cat-3', foto: null, ativo: true, created_at: '' },
  { id: 'srv-8', nome: 'Combo VIP', descricao: 'Corte premium + barba completa + hidratação', preco: 130, duracao_minutos: 90, categoria_id: 'cat-4', foto: null, ativo: true, created_at: '' },
  { id: 'srv-9', nome: 'Combo Essencial', descricao: 'Corte social + barba completa', preco: 75, duracao_minutos: 55, categoria_id: 'cat-4', foto: null, ativo: true, created_at: '' },
];

export const mockBarbeiros = [
  { id: 'bar-1', nome: 'Rafael Silva', foto: null, telefone: '(11) 99999-1111', especialidade: 'Cortes Degradê', comissao: 40, ativo: true, user_id: null, created_at: '' },
  { id: 'bar-2', nome: 'Lucas Mendes', foto: null, telefone: '(11) 99999-2222', especialidade: 'Barba & Bigode', comissao: 40, ativo: true, user_id: null, created_at: '' },
  { id: 'bar-3', nome: 'André Costa', foto: null, telefone: '(11) 99999-3333', especialidade: 'Cortes Clássicos', comissao: 35, ativo: true, user_id: null, created_at: '' },
  { id: 'bar-4', nome: 'Thiago Oliveira', foto: null, telefone: '(11) 99999-4444', especialidade: 'Tratamentos Premium', comissao: 45, ativo: true, user_id: null, created_at: '' },
];

export const mockHorarios = [
  // Rafael - Seg a Sab
  { id: 'h-1', barbeiro_id: 'bar-1', dia_semana: 1, inicio: '09:00', fim: '19:00' },
  { id: 'h-2', barbeiro_id: 'bar-1', dia_semana: 2, inicio: '09:00', fim: '19:00' },
  { id: 'h-3', barbeiro_id: 'bar-1', dia_semana: 3, inicio: '09:00', fim: '19:00' },
  { id: 'h-4', barbeiro_id: 'bar-1', dia_semana: 4, inicio: '09:00', fim: '19:00' },
  { id: 'h-5', barbeiro_id: 'bar-1', dia_semana: 5, inicio: '09:00', fim: '19:00' },
  { id: 'h-6', barbeiro_id: 'bar-1', dia_semana: 6, inicio: '09:00', fim: '15:00' },
  // Lucas - Seg a Sex
  { id: 'h-7', barbeiro_id: 'bar-2', dia_semana: 1, inicio: '10:00', fim: '20:00' },
  { id: 'h-8', barbeiro_id: 'bar-2', dia_semana: 2, inicio: '10:00', fim: '20:00' },
  { id: 'h-9', barbeiro_id: 'bar-2', dia_semana: 3, inicio: '10:00', fim: '20:00' },
  { id: 'h-10', barbeiro_id: 'bar-2', dia_semana: 4, inicio: '10:00', fim: '20:00' },
  { id: 'h-11', barbeiro_id: 'bar-2', dia_semana: 5, inicio: '10:00', fim: '20:00' },
  // André - Ter a Sab
  { id: 'h-12', barbeiro_id: 'bar-3', dia_semana: 2, inicio: '08:00', fim: '18:00' },
  { id: 'h-13', barbeiro_id: 'bar-3', dia_semana: 3, inicio: '08:00', fim: '18:00' },
  { id: 'h-14', barbeiro_id: 'bar-3', dia_semana: 4, inicio: '08:00', fim: '18:00' },
  { id: 'h-15', barbeiro_id: 'bar-3', dia_semana: 5, inicio: '08:00', fim: '18:00' },
  { id: 'h-16', barbeiro_id: 'bar-3', dia_semana: 6, inicio: '08:00', fim: '14:00' },
  // Thiago - Seg a Sex
  { id: 'h-17', barbeiro_id: 'bar-4', dia_semana: 1, inicio: '09:00', fim: '18:00' },
  { id: 'h-18', barbeiro_id: 'bar-4', dia_semana: 2, inicio: '09:00', fim: '18:00' },
  { id: 'h-19', barbeiro_id: 'bar-4', dia_semana: 3, inicio: '09:00', fim: '18:00' },
  { id: 'h-20', barbeiro_id: 'bar-4', dia_semana: 4, inicio: '09:00', fim: '18:00' },
  { id: 'h-21', barbeiro_id: 'bar-4', dia_semana: 5, inicio: '09:00', fim: '18:00' },
];

export const mockAgendamentos = [
  {
    id: 'ag-1',
    cliente_id: 'cli-1',
    barbeiro_id: 'bar-1',
    servico_id: 'srv-2',
    data: '2026-03-18',
    hora: '14:00',
    status: 'agendado' as const,
    observacao: null,
    created_at: '2026-03-14T10:00:00Z',
  },
  {
    id: 'ag-2',
    cliente_id: 'cli-1',
    barbeiro_id: 'bar-2',
    servico_id: 'srv-4',
    data: '2026-03-20',
    hora: '10:30',
    status: 'confirmado' as const,
    observacao: 'Preferência por navalha',
    created_at: '2026-03-13T15:00:00Z',
  },
  {
    id: 'ag-3',
    cliente_id: 'cli-1',
    barbeiro_id: 'bar-3',
    servico_id: 'srv-8',
    data: '2026-03-10',
    hora: '09:00',
    status: 'finalizado' as const,
    observacao: null,
    created_at: '2026-03-08T12:00:00Z',
  },
  {
    id: 'ag-4',
    cliente_id: 'cli-1',
    barbeiro_id: 'bar-1',
    servico_id: 'srv-1',
    data: '2026-03-05',
    hora: '16:00',
    status: 'cancelado' as const,
    observacao: null,
    created_at: '2026-03-03T09:00:00Z',
  },
  {
    id: 'ag-5',
    cliente_id: 'cli-1',
    barbeiro_id: 'bar-4',
    servico_id: 'srv-6',
    data: '2026-03-01',
    hora: '11:00',
    status: 'finalizado' as const,
    observacao: null,
    created_at: '2026-02-28T14:00:00Z',
  },
];

export const mockAvaliacoes = [
  { id: 'av-1', agendamento_id: 'ag-3', cliente_id: 'cli-1', barbeiro_id: 'bar-3', nota: 5, comentario: 'Excelente atendimento! Combo VIP vale cada centavo.', created_at: '2026-03-10T12:00:00Z' },
];

// Helpers
export function getServicoById(id: string) {
  return mockServicos.find(s => s.id === id);
}

export function getBarbeiroById(id: string) {
  return mockBarbeiros.find(b => b.id === id);
}

export function getCategoriaById(id: string) {
  return mockCategorias.find(c => c.id === id);
}

export function formatPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDuracao(minutos: number) {
  if (minutos >= 60) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${h}h${m}min` : `${h}h`;
  }
  return `${minutos} min`;
}

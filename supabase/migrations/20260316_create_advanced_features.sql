-- Migration: Create tables for advanced availability and notifications
-- Date: 2026-03-16
-- Description: Creates feriados, configuracoes, and barbeiro_servicos tables

-- Criar tabela de feriados
CREATE TABLE IF NOT EXISTS feriados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL UNIQUE,
  descricao TEXT,
  aberto BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(255) NOT NULL UNIQUE,
  valor TEXT,
  tipo VARCHAR(50) DEFAULT 'string',
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de relacionamento barbeiro_servicos (para futura expansão)
CREATE TABLE IF NOT EXISTS barbeiro_servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbeiro_id UUID NOT NULL REFERENCES barbeiros(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  especialidade TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(barbeiro_id, servico_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE feriados ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbeiro_servicos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para feriados (público pode ler, admin pode gerenciar)
CREATE POLICY "Qualquer um pode ver feriados" ON feriados FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar feriados" ON feriados FOR ALL USING (
  EXISTS (
    SELECT 1 FROM perfis 
    WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
  )
);

-- Criar políticas RLS para configurações (público pode ler, admin pode gerenciar)
CREATE POLICY "Qualquer um pode ver configurações" ON configuracoes FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar configurações" ON configuracoes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM perfis 
    WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
  )
);

-- Criar políticas RLS para barbeiro_servicos (público pode ler)
CREATE POLICY "Qualquer um pode ver barbeiro_servicos" ON barbeiro_servicos FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar barbeiro_servicos" ON barbeiro_servicos FOR ALL USING (
  EXISTS (
    SELECT 1 FROM perfis 
    WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
  )
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, tipo, descricao) VALUES
  ('endereco', 'Av. Exemplo, 123 - São Paulo, SP', 'string', 'Endereço da barbearia'),
  ('whatsapp', '(11) 98765-4321', 'string', 'Número de WhatsApp para contato'),
  ('email_contato', 'contato@vivaz.com', 'string', 'E-mail de contato da barbearia'),
  ('intervalo_agendamentos', '15', 'number', 'Intervalo mínimo entre agendamentos em minutos'),
  ('horario_abertura', '09:00', 'string', 'Horário de abertura padrão'),
  ('horario_fechamento', '19:00', 'string', 'Horário de fechamento padrão')
ON CONFLICT (chave) DO NOTHING;

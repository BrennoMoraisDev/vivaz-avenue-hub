-- Migration: Sistema de Fidelidade e BI Avançado
-- Date: 2026-03-17

-- ─── Tabela de Pontos de Fidelidade ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fidelidade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  pontos INTEGER NOT NULL DEFAULT 1,
  tipo VARCHAR(20) NOT NULL DEFAULT 'ganho', -- 'ganho' | 'resgatado'
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fidelidade_cliente ON fidelidade(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fidelidade_tipo ON fidelidade(tipo);

-- RLS
ALTER TABLE fidelidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente vê própria fidelidade" ON fidelidade
  FOR SELECT USING (cliente_id = auth.uid());

CREATE POLICY "Admin gerencia fidelidade" ON fidelidade
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin')
  );

CREATE POLICY "Barbeiro insere fidelidade" ON fidelidade
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.role IN ('barbeiro', 'admin'))
  );

-- ─── View: Resumo de Fidelidade por Cliente ───────────────────────────────────
CREATE OR REPLACE VIEW fidelidade_resumo AS
SELECT
  cliente_id,
  SUM(CASE WHEN tipo = 'ganho' THEN pontos ELSE 0 END) AS pontos_ganhos,
  SUM(CASE WHEN tipo = 'resgatado' THEN pontos ELSE 0 END) AS pontos_resgatados,
  SUM(CASE WHEN tipo = 'ganho' THEN pontos ELSE -pontos END) AS pontos_disponiveis,
  COUNT(CASE WHEN tipo = 'ganho' THEN 1 END) AS total_cortes
FROM fidelidade
GROUP BY cliente_id;

-- ─── Configurações adicionais ─────────────────────────────────────────────────
INSERT INTO configuracoes (chave, valor, tipo, descricao) VALUES
  ('fidelidade_pontos_por_corte', '1', 'number', 'Pontos ganhos por corte'),
  ('fidelidade_pontos_para_resgate', '10', 'number', 'Pontos necessários para resgate de corte grátis'),
  ('fidelidade_ativo', 'true', 'boolean', 'Sistema de fidelidade ativo'),
  ('dias_retorno_lembrete', '20', 'number', 'Dias sem visita para enviar lembrete de retorno'),
  ('whatsapp_numero', '', 'string', 'Número WhatsApp da barbearia (com DDI, ex: 5511999999999)')
ON CONFLICT (chave) DO NOTHING;

-- ─── Função para calcular pontos de fidelidade automaticamente ────────────────
CREATE OR REPLACE FUNCTION fn_atualizar_fidelidade()
RETURNS TRIGGER AS $$
DECLARE
  v_pontos_config INTEGER;
BEGIN
  -- Só processa quando status muda para 'finalizado'
  IF NEW.status = 'finalizado' AND (OLD.status IS NULL OR OLD.status != 'finalizado') THEN
    -- Busca configuração de pontos
    SELECT COALESCE(valor::integer, 1) INTO v_pontos_config
    FROM configuracoes WHERE chave = 'fidelidade_pontos_por_corte';

    -- Insere ponto de fidelidade
    INSERT INTO fidelidade (cliente_id, agendamento_id, pontos, tipo, descricao)
    VALUES (
      NEW.cliente_id,
      NEW.id,
      COALESCE(v_pontos_config, 1),
      'ganho',
      'Corte finalizado'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para fidelidade automática
DROP TRIGGER IF EXISTS trg_fidelidade ON agendamentos;
CREATE TRIGGER trg_fidelidade
  AFTER UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION fn_atualizar_fidelidade();

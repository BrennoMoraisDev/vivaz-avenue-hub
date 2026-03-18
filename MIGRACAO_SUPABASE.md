# Migração Supabase — Sistema de Fidelidade e BI

## Como aplicar a migração

Acesse o painel do Supabase → **SQL Editor** e execute o conteúdo do arquivo:

```
supabase/migrations/20260317_fidelidade_bi.sql
```

### O que a migração cria:

1. **Tabela `fidelidade`** — Registra pontos ganhos e resgatados por cliente
2. **View `fidelidade_resumo`** — Agrega pontos disponíveis por cliente
3. **Trigger `trg_fidelidade`** — Adiciona ponto automaticamente quando um agendamento é finalizado
4. **Configurações padrão** na tabela `configuracoes`:
   - `fidelidade_pontos_por_corte` = 1
   - `fidelidade_pontos_para_resgate` = 10
   - `fidelidade_ativo` = true
   - `dias_retorno_lembrete` = 20
   - `whatsapp_numero` = (vazio, configure no admin)

### Verificar se a tabela `configuracoes` existe

Se a tabela `configuracoes` ainda não existir no seu banco, crie antes:

```sql
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  tipo VARCHAR(20) DEFAULT 'string',
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gerencia configuracoes" ON configuracoes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin')
  );
```

Depois execute a migração principal.

-- ============================================================
-- VIVAZ BARBEARIA - SQL DE CORREÇÃO DO BANCO DE DADOS
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- ─── 1. CORRIGIR TRIGGER DE CRIAÇÃO DE USUÁRIO ───────────────────────────────
-- O trigger original pode falhar se o perfil já existir (race condition)
-- ou se houver problema de constraint. Esta versão é mais robusta.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir perfil apenas se não existir (evita erro de constraint)
  INSERT INTO public.perfis (id, nome, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE
      WHEN NEW.email IN ('breno_fsa@yahoo.com', 'brennomoraisdev@gmail.com') THEN 'admin'
      ELSE 'cliente'
    END
  )
  ON CONFLICT (id) DO NOTHING;

  -- Criar registro de cliente automaticamente
  INSERT INTO public.clientes (id, nome, telefone, user_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'telefone',
    NEW.id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca bloquear a criação do usuário por erro no trigger
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. POLÍTICAS RLS PARA BARBEIROS ─────────────────────────────────────────
-- Barbeiros precisam ler e atualizar seus próprios agendamentos

-- Remover políticas antigas conflitantes se existirem
DROP POLICY IF EXISTS "Barbeiros podem ver seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Barbeiros podem atualizar seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Clientes podem criar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Barbeiros podem ver clientes" ON clientes;
DROP POLICY IF EXISTS "Barbeiros podem inserir clientes" ON clientes;
DROP POLICY IF EXISTS "Barbeiros podem ver todos os perfis" ON perfis;

-- Agendamentos: barbeiro pode ver os seus
CREATE POLICY "Barbeiros podem ver seus agendamentos" ON agendamentos
  FOR SELECT USING (
    barbeiro_id IN (
      SELECT id FROM barbeiros WHERE user_id = auth.uid()
    )
  );

-- Agendamentos: barbeiro pode atualizar status dos seus
CREATE POLICY "Barbeiros podem atualizar seus agendamentos" ON agendamentos
  FOR UPDATE USING (
    barbeiro_id IN (
      SELECT id FROM barbeiros WHERE user_id = auth.uid()
    )
  );

-- Agendamentos: clientes podem criar agendamentos
CREATE POLICY "Clientes podem criar agendamentos" ON agendamentos
  FOR INSERT WITH CHECK (
    cliente_id IN (
      SELECT id FROM clientes WHERE user_id = auth.uid()
    )
    OR
    cliente_id = auth.uid()
  );

-- Agendamentos: clientes podem cancelar seus próprios agendamentos
DROP POLICY IF EXISTS "Clientes podem cancelar agendamentos" ON agendamentos;
CREATE POLICY "Clientes podem cancelar agendamentos" ON agendamentos
  FOR UPDATE USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE user_id = auth.uid()
    )
    OR
    cliente_id = auth.uid()
  );

-- Clientes: barbeiros podem ver a lista de clientes
CREATE POLICY "Barbeiros podem ver clientes" ON clientes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.role IN ('barbeiro', 'admin')
    )
  );

-- Clientes: barbeiros podem inserir novos clientes
CREATE POLICY "Barbeiros podem inserir clientes" ON clientes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.role IN ('barbeiro', 'admin')
    )
  );

-- Clientes: usuário pode ver e atualizar seu próprio registro
DROP POLICY IF EXISTS "Usuário pode ver próprio cliente" ON clientes;
DROP POLICY IF EXISTS "Usuário pode atualizar próprio cliente" ON clientes;
DROP POLICY IF EXISTS "Usuário pode inserir próprio cliente" ON clientes;

CREATE POLICY "Usuário pode ver próprio cliente" ON clientes
  FOR SELECT USING (user_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Usuário pode atualizar próprio cliente" ON clientes
  FOR UPDATE USING (user_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Usuário pode inserir próprio cliente" ON clientes
  FOR INSERT WITH CHECK (user_id = auth.uid() OR id = auth.uid());

-- Perfis: barbeiros podem ver todos os perfis (necessário para algumas queries)
CREATE POLICY "Barbeiros podem ver todos os perfis" ON perfis
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.role IN ('barbeiro', 'admin')
    )
  );

-- ─── 3. CORRIGIR POLÍTICA DE PERFIS (evitar recursão) ────────────────────────
-- A política original "Usuários podem ver próprio perfil" pode causar recursão
-- quando barbeiros tentam verificar roles. Vamos substituir por uma mais robusta.

DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON perfis;
DROP POLICY IF EXISTS "Barbeiros podem ver todos os perfis" ON perfis;

-- Política unificada para SELECT em perfis
CREATE POLICY "Perfis: select policy" ON perfis
  FOR SELECT USING (
    auth.uid() = id
    OR (
      SELECT role FROM perfis WHERE id = auth.uid()
    ) IN ('barbeiro', 'admin')
  );

-- ─── 4. DADOS DE TESTE ───────────────────────────────────────────────────────
-- ATENÇÃO: Execute esta seção APENAS se quiser criar dados de teste
-- Os usuários de auth devem ser criados via Supabase Auth Admin API
-- ou pelo painel do Supabase (Authentication > Users > Add User)
--
-- Após criar os usuários no painel, use os IDs gerados abaixo:
--
-- Usuário de teste (cliente):
--   Email: cliente.teste@vivaz.com
--   Senha: Vivaz@2026
--
-- Barbeiro de teste:
--   Email: barbeiro.teste@vivaz.com
--   Senha: Vivaz@2026
--
-- Admin de teste (já configurado via ADMIN_EMAILS no código):
--   Email: brennomoraisdev@gmail.com (já é admin)

-- Inserir categorias de serviço de exemplo (se não existirem)
INSERT INTO categorias_servico (nome, ordem) VALUES
  ('Cortes', 1),
  ('Barba', 2),
  ('Tratamentos', 3)
ON CONFLICT DO NOTHING;

-- Inserir serviços de exemplo (se não existirem)
INSERT INTO servicos (nome, descricao, preco, duracao_minutos, ativo)
SELECT 'Corte Simples', 'Corte de cabelo tradicional', 35.00, 30, true
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Corte Simples');

INSERT INTO servicos (nome, descricao, preco, duracao_minutos, ativo)
SELECT 'Corte + Barba', 'Corte de cabelo com barba completa', 55.00, 60, true
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Corte + Barba');

INSERT INTO servicos (nome, descricao, preco, duracao_minutos, ativo)
SELECT 'Barba Completa', 'Barba com navalha e hidratação', 30.00, 30, true
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Barba Completa');

INSERT INTO servicos (nome, descricao, preco, duracao_minutos, ativo)
SELECT 'Corte Degradê', 'Degradê com acabamento perfeito', 45.00, 45, true
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Corte Degradê');

-- ─── 5. VERIFICAÇÃO ──────────────────────────────────────────────────────────
-- Execute estas queries para verificar se tudo está correto:

-- SELECT * FROM perfis LIMIT 10;
-- SELECT * FROM clientes LIMIT 10;
-- SELECT * FROM barbeiros LIMIT 10;
-- SELECT * FROM servicos;
-- SELECT * FROM categorias_servico;
-- SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies WHERE tablename IN ('perfis', 'clientes', 'barbeiros', 'agendamentos') ORDER BY tablename, policyname;

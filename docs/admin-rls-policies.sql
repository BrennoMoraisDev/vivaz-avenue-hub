-- RLS Policies para Admin (acesso total)
-- Execute no SQL Editor do Supabase

-- Admin: acesso total a perfis
CREATE POLICY "Admin acesso total perfis" ON perfis
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'));

-- Admin: acesso total a clientes
CREATE POLICY "Admin acesso total clientes" ON clientes
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'));

-- Admin: acesso total a barbeiros
CREATE POLICY "Admin acesso total barbeiros" ON barbeiros
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'));

-- Admin: acesso total a horarios_barbeiro
CREATE POLICY "Admin acesso total horarios" ON horarios_barbeiro
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'));

-- Admin: acesso total a bloqueios_barbeiro
CREATE POLICY "Admin acesso total bloqueios" ON bloqueios_barbeiro
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'));

-- Admin: acesso total a categorias_servico
CREATE POLICY "Admin acesso total categorias" ON categorias_servico
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'));

-- Admin: acesso total a servicos
CREATE POLICY "Admin acesso total servicos" ON servicos
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'));

-- Admin: acesso total a agendamentos
CREATE POLICY "Admin acesso total agendamentos" ON agendamentos
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'));

-- Admin: acesso total a avaliacoes
CREATE POLICY "Admin acesso total avaliacoes" ON avaliacoes
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM perfis WHERE role = 'admin'));

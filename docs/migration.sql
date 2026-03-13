-- Vivaz Barbearia Avenue - Schema Inicial
-- Execute este SQL no SQL Editor do seu Supabase
-- Copie e cole todo o conteúdo abaixo no SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE perfis (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nome TEXT,
  telefone TEXT,
  role TEXT CHECK (role IN ('cliente', 'barbeiro', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT,
  telefone TEXT,
  email TEXT,
  user_id UUID REFERENCES perfis(id) NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE barbeiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT,
  foto TEXT,
  telefone TEXT,
  especialidade TEXT,
  comissao DECIMAL(5,2),
  ativo BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES perfis(id) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE horarios_barbeiro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbeiro_id UUID REFERENCES barbeiros(id) ON DELETE CASCADE,
  dia_semana INT,
  inicio TIME,
  fim TIME
);

CREATE TABLE bloqueios_barbeiro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbeiro_id UUID REFERENCES barbeiros(id) ON DELETE CASCADE,
  data DATE,
  motivo TEXT
);

CREATE TABLE categorias_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT,
  ordem INT
);

CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT,
  descricao TEXT,
  preco DECIMAL(10,2),
  duracao_minutos INT,
  categoria_id UUID REFERENCES categorias_servico(id),
  foto TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  barbeiro_id UUID REFERENCES barbeiros(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
  data DATE,
  hora TIME,
  status TEXT CHECK (status IN ('agendado','confirmado','em atendimento','finalizado','cancelado','faltou')),
  observacao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id),
  barbeiro_id UUID REFERENCES barbeiros(id),
  nota INT CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_barbeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueios_barbeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuários podem ver próprio perfil" ON perfis FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar próprio perfil" ON perfis FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Inserir próprio perfil" ON perfis FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Clientes podem ver próprios agendamentos" ON agendamentos FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM clientes WHERE id = cliente_id)
);

CREATE POLICY "Serviços visíveis" ON servicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categorias visíveis" ON categorias_servico FOR SELECT TO authenticated USING (true);
CREATE POLICY "Barbeiros visíveis" ON barbeiros FOR SELECT TO authenticated USING (true);
CREATE POLICY "Horários visíveis" ON horarios_barbeiro FOR SELECT TO authenticated USING (true);
CREATE POLICY "Bloqueios visíveis" ON bloqueios_barbeiro FOR SELECT TO authenticated USING (true);

-- Trigger para criar perfil no registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome', 'cliente');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

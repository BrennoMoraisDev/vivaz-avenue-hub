-- 1. Adicionar coluna hora_fim para facilitar a validação de conflitos
-- Primeiro, vamos garantir que a coluna existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'hora_fim') THEN
        ALTER TABLE agendamentos ADD COLUMN hora_fim TIME;
    END IF;
END $$;

-- 2. Função para calcular a hora de fim baseada na duração do serviço
CREATE OR REPLACE FUNCTION fn_calcular_hora_fim()
RETURNS TRIGGER AS $$
DECLARE
    v_duracao INTEGER;
BEGIN
    -- Buscar a duração do serviço
    SELECT duracao_minutos INTO v_duracao FROM servicos WHERE id = NEW.servico_id;
    
    -- Se não encontrar a duração, assume 30 minutos por padrão
    IF v_duracao IS NULL THEN
        v_duracao := 30;
    END IF;
    
    -- Calcular hora_fim
    NEW.hora_fim := (NEW.hora::time + (v_duracao || ' minutes')::interval)::time;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para calcular hora_fim antes de inserir ou atualizar
DROP TRIGGER IF EXISTS trg_calcular_hora_fim ON agendamentos;
CREATE TRIGGER trg_calcular_hora_fim
BEFORE INSERT OR UPDATE OF hora, servico_id ON agendamentos
FOR EACH ROW EXECUTE FUNCTION fn_calcular_hora_fim();

-- 4. Atualizar registros existentes (opcional, mas recomendado)
UPDATE agendamentos SET hora = hora WHERE hora_fim IS NULL;

-- 5. Função para validar conflitos de horários
CREATE OR REPLACE FUNCTION fn_validar_conflito_agendamento()
RETURNS TRIGGER AS $$
BEGIN
    -- Só validar se o status for 'agendado' ou 'confirmado'
    IF NEW.status NOT IN ('agendado', 'confirmado', 'em_atendimento') THEN
        RETURN NEW;
    END IF;

    -- Verificar se existe outro agendamento para o mesmo barbeiro, na mesma data, com sobreposição de horário
    -- Regra de sobreposição: (Inicio1 < Fim2) AND (Fim1 > Inicio2)
    IF EXISTS (
        SELECT 1 FROM agendamentos
        WHERE barbeiro_id = NEW.barbeiro_id
          AND data = NEW.data
          AND id <> NEW.id -- Ignorar o próprio registro em caso de update
          AND status IN ('agendado', 'confirmado', 'em_atendimento')
          AND (NEW.hora::time < hora_fim)
          AND (NEW.hora_fim > hora::time)
    ) THEN
        RAISE EXCEPTION 'Conflito de horário: O barbeiro já possui um agendamento neste período.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para validar conflitos antes de inserir ou atualizar
DROP TRIGGER IF EXISTS trg_validar_conflito_agendamento ON agendamentos;
CREATE TRIGGER trg_validar_conflito_agendamento
BEFORE INSERT OR UPDATE OF data, hora, hora_fim, barbeiro_id, status ON agendamentos
FOR EACH ROW EXECUTE FUNCTION fn_validar_conflito_agendamento();

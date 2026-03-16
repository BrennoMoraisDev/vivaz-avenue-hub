# Guia de Implementação - Melhorias Avançadas

Este documento descreve as melhorias implementadas no projeto Vivaz Barbearia Avenue, incluindo regras avançadas de disponibilidade e sistema de notificações.

## 📋 Índice

1. [Migração do Banco de Dados](#migração-do-banco-de-dados)
2. [Edge Functions](#edge-functions)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Componentes Frontend](#componentes-frontend)
5. [Testes](#testes)

---

## 🗄️ Migração do Banco de Dados

### Tabelas Criadas

Três novas tabelas foram criadas para suportar as funcionalidades avançadas:

#### 1. **feriados**
Gerencia dias de funcionamento especial ou fechamento.

```sql
CREATE TABLE feriados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL UNIQUE,
  descricao TEXT,
  aberto BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
- `data`: Data do feriado (formato YYYY-MM-DD)
- `descricao`: Descrição do feriado (ex: "Natal", "Ano Novo")
- `aberto`: Se `false`, a barbearia está fechada; se `true`, pode ter horário especial

#### 2. **configuracoes**
Armazena configurações globais da barbearia.

```sql
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(255) NOT NULL UNIQUE,
  valor TEXT,
  tipo VARCHAR(50) DEFAULT 'string',
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Configurações Padrão:**
- `endereco`: Endereço da barbearia
- `whatsapp`: Número de WhatsApp para contato
- `email_contato`: E-mail de contato
- `intervalo_agendamentos`: Intervalo mínimo entre agendamentos (em minutos)
- `horario_abertura`: Horário de abertura padrão (HH:MM)
- `horario_fechamento`: Horário de fechamento padrão (HH:MM)

#### 3. **barbeiro_servicos**
Relacionamento entre barbeiros e serviços (para futura expansão).

```sql
CREATE TABLE barbeiro_servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbeiro_id UUID NOT NULL REFERENCES barbeiros(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  especialidade TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(barbeiro_id, servico_id)
);
```

### Executar Migração

Para executar a migração no Supabase:

1. Acesse o **SQL Editor** do Supabase
2. Copie o conteúdo do arquivo `supabase/migrations/20260316_create_advanced_features.sql`
3. Cole no editor SQL
4. Clique em **Run** para executar

Ou use a CLI do Supabase:

```bash
supabase db push
```

---

## 🔧 Edge Functions

### send-email-confirmation

Responsável por enviar e-mails de confirmação de agendamento.

**Localização:** `supabase/functions/send-email-confirmation/index.ts`

**Payload esperado:**
```json
{
  "to": "cliente@email.com",
  "nome": "João Silva",
  "servico": "Corte Social",
  "barbeiro": "Rafael Silva",
  "data": "2026-03-20",
  "hora": "14:30",
  "endereco": "Av. Exemplo, 123",
  "whatsapp": "(11) 98765-4321"
}
```

**Configuração:**

1. **Instalar Resend API Key no Supabase:**
   - Acesse o Supabase Dashboard
   - Vá para **Project Settings → Secrets**
   - Crie um novo secret: `RESEND_API_KEY`
   - Copie sua chave da Resend (https://resend.com)

2. **Deploy da Edge Function:**
   ```bash
   supabase functions deploy send-email-confirmation
   ```

3. **Testar a função:**
   ```bash
   supabase functions invoke send-email-confirmation \
     --body '{"to":"test@example.com","nome":"João","servico":"Corte","barbeiro":"Rafael","data":"2026-03-20","hora":"14:30","endereco":"Av. Exemplo, 123"}'
   ```

---

## 🔐 Variáveis de Ambiente

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://okmuhustvzkbwxsfemxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Secrets

- `RESEND_API_KEY`: Chave da API Resend para envio de e-mails

---

## 🎨 Componentes Frontend

### Hooks Necessários

#### `useConfiguracoes()`
Busca as configurações globais do banco de dados.

```typescript
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

const { configuracoes, loading, error } = useConfiguracoes();
const endereco = configuracoes?.find(c => c.chave === 'endereco')?.valor;
const intervalo = parseInt(configuracoes?.find(c => c.chave === 'intervalo_agendamentos')?.valor || '15');
```

#### `useFeriados()`
Busca os feriados cadastrados.

```typescript
import { useFeriados } from '@/hooks/useFeriados';

const { feriados, loading } = useFeriados();
const isFeriado = (date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return feriados.some(f => f.data === dateStr && !f.aberto);
};
```

### Atualização do TimeSlotPicker

O componente `TimeSlotPicker` deve ser atualizado para:

1. Considerar o intervalo mínimo entre agendamentos
2. Excluir feriados das datas disponíveis
3. Respeitar as configurações de horário de abertura/fechamento

**Exemplo:**
```typescript
const disabledDays = (date: Date) => {
  if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
  if (isFeriado(date)) return true; // Novo: verificar feriados
  return !diasTrabalho.has(date.getDay());
};
```

### Atualização do ClienteAgendar

O componente deve ser atualizado para:

1. Buscar serviços e barbeiros do Supabase (não de mockData)
2. Persistir agendamentos no banco de dados
3. Enviar e-mail de confirmação após agendamento

**Exemplo:**
```typescript
const handleConfirm = async () => {
  // Inserir agendamento no banco
  const { data, error } = await supabase
    .from('agendamentos')
    .insert([{
      cliente_id: user.id,
      barbeiro_id: barbeiroId,
      servico_id: servicoId,
      data: dataStr,
      hora: hora,
      status: 'agendado'
    }])
    .select()
    .single();

  if (error) {
    toast({ title: 'Erro', description: error.message });
    return;
  }

  // Enviar e-mail de confirmação
  const { error: emailError } = await supabase.functions.invoke(
    'send-email-confirmation',
    {
      body: {
        to: user.email,
        nome: user.user_metadata?.nome,
        servico: servico?.nome,
        barbeiro: barbeiro?.nome,
        data: dataStr,
        hora: hora,
        endereco: configuracoes?.find(c => c.chave === 'endereco')?.valor,
        whatsapp: configuracoes?.find(c => c.chave === 'whatsapp')?.valor,
      }
    }
  );

  toast({
    title: '✅ Agendamento confirmado!',
    description: 'Um e-mail de confirmação foi enviado para você.'
  });

  navigate('/cliente/historico');
};
```

---

## 🧪 Testes

### Teste Manual do Fluxo Completo

1. **Criar um feriado:**
   ```sql
   INSERT INTO feriados (data, descricao, aberto)
   VALUES ('2026-03-25', 'Feriado de Teste', false);
   ```

2. **Agendar um serviço:**
   - Acesse a área do cliente
   - Selecione um serviço
   - Selecione um barbeiro
   - Escolha uma data (não feriado)
   - Selecione um horário
   - Confirme o agendamento

3. **Verificar:**
   - Agendamento deve aparecer no histórico do cliente
   - Agendamento deve aparecer no painel do admin
   - E-mail de confirmação deve ser recebido

### Teste da Edge Function

```bash
curl -X POST https://okmuhustvzkbwxsfemxn.supabase.co/functions/v1/send-email-confirmation \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@example.com",
    "nome": "João Silva",
    "servico": "Corte Social",
    "barbeiro": "Rafael Silva",
    "data": "2026-03-20",
    "hora": "14:30",
    "endereco": "Av. Exemplo, 123",
    "whatsapp": "(11) 98765-4321"
  }'
```

---

## 📝 Próximas Etapas

- [ ] Implementar notificações por WhatsApp (Twilio/WhatsApp Business API)
- [ ] Implementar lembretes automáticos (24h antes)
- [ ] Criar interface de gerenciamento de feriados no admin
- [ ] Criar interface de gerenciamento de configurações no admin
- [ ] Implementar bloqueios recorrentes para barbeiros
- [ ] Adicionar suporte a múltiplos barbeiros por serviço

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Resend](https://resend.com/docs)
- [Repositório do Projeto](https://github.com/BrennoMoraisDev/vivaz-avenue-hub)

# Vivaz Barbearia Avenue

Sistema de agendamento online para barbearia de luxo, desenvolvido com Next.js, React, TypeScript e Supabase.

## 🎯 Características

- ✅ **Autenticação Segura** - Email/senha e Google OAuth via Supabase Auth
- ✅ **Agendamento Inteligente** - Sistema de disponibilidade com cálculo de intervalos e feriados
- ✅ **Múltiplos Papéis** - Cliente, Barbeiro e Administrador
- ✅ **Notificações** - E-mails de confirmação via Resend
- ✅ **PWA Completo** - Instalável em dispositivos móveis
- ✅ **Design Responsivo** - Mobile-first com Tailwind CSS
- ✅ **Dashboard Administrativo** - Gerenciamento completo de barbeiros, serviços e agendamentos
- ✅ **Relatórios** - Visualização de ganhos e histórico de atendimentos

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ e npm/pnpm
- Conta Supabase (https://supabase.com)
- Conta Resend (https://resend.com) - para e-mails

### 1. Clonar o Repositório

\`\`\`bash
git clone https://github.com/BrennoMoraisDev/vivaz-avenue-hub.git
cd vivaz-avenue-hub
\`\`\`

### 2. Instalar Dependências

\`\`\`bash
npm install
# ou
pnpm install
\`\`\`

### 3. Configurar Variáveis de Ambiente

Crie um arquivo \`.env.local\` na raiz do projeto:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://okmuhustvzkbwxsfemxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend (opcional, para e-mails)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
\`\`\`

### 4. Executar Localmente

\`\`\`bash
npm run dev
# ou
pnpm dev
\`\`\`

Acesse http://localhost:3000

## 📋 Configuração do Supabase

### Executar Migrações

1. Acesse o **SQL Editor** do Supabase
2. Copie o conteúdo de \`supabase/migrations/20260316_create_advanced_features.sql\`
3. Cole no editor SQL e execute

Ou via CLI:

\`\`\`bash
supabase db push
\`\`\`

### Configurar Secrets para Edge Functions

1. Vá para **Project Settings → Secrets**
2. Crie um novo secret: \`RESEND_API_KEY\`
3. Cole sua chave da API Resend

### Deploy da Edge Function

\`\`\`bash
supabase functions deploy send-email-confirmation
\`\`\`

## 🏗️ Estrutura do Projeto

\`\`\`
vivaz-avenue-hub/
├── src/
│   ├── app/                 # App Router do Next.js
│   ├── components/          # Componentes React
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários e configurações
│   ├── pages/              # Páginas da aplicação
│   └── data/               # Dados mockados (deprecated)
├── public/                 # Arquivos estáticos
│   ├── icons/             # Ícones do PWA
│   └── manifest.json      # Configuração do PWA
├── supabase/
│   ├── migrations/        # Migrações SQL
│   └── functions/         # Edge Functions
├── IMPLEMENTATION_GUIDE.md # Guia de implementação
└── README.md             # Este arquivo
\`\`\`

## 🔐 Autenticação

### Criar Conta

1. Acesse http://localhost:3000/auth/register
2. Preencha email e senha
3. Confirme seu e-mail (verificação automática em desenvolvimento)

### Login

- Email/Senha
- Google OAuth (se configurado)

### Recuperação de Senha

Acesse http://localhost:3000/auth/forgot-password

## 👥 Papéis e Permissões

| Papel | Acesso | Funcionalidades |
|-------|--------|-----------------|
| **Cliente** | \`/cliente/*\` | Agendar, visualizar histórico, avaliar |
| **Barbeiro** | \`/barbeiro/*\` | Dashboard, alterar status, registrar atendimento |
| **Admin** | \`/admin/*\` | Gerenciar barbeiros, serviços, agendamentos |

## 📱 PWA (Progressive Web App)

### Instalar no Mobile

1. Acesse o site em um navegador móvel
2. Procure pela opção "Adicionar à tela inicial" ou "Instalar"
3. Confirme a instalação

### Ícones Personalizados

Substitua os ícones em \`public/icons/\`:
- \`icon-192x192.png\` (192x192 pixels)
- \`icon-512x512.png\` (512x512 pixels)
- Versões maskable para melhor compatibilidade

## 📧 Notificações por E-mail

### Configurar Resend

1. Crie uma conta em https://resend.com
2. Obtenha sua API Key
3. Adicione como secret no Supabase: \`RESEND_API_KEY\`
4. Deploy a Edge Function: \`supabase functions deploy send-email-confirmation\`

### Testar Envio de E-mail

\`\`\`bash
supabase functions invoke send-email-confirmation \
  --body '{
    "to": "seu-email@example.com",
    "nome": "João Silva",
    "servico": "Corte Social",
    "barbeiro": "Rafael Silva",
    "data": "2026-03-20",
    "hora": "14:30",
    "endereco": "Av. Exemplo, 123",
    "whatsapp": "(11) 98765-4321"
  }'
\`\`\`

## 🚀 Deploy na Vercel

### 1. Conectar Repositório

1. Acesse https://vercel.com
2. Clique em "New Project"
3. Selecione seu repositório GitHub

### 2. Configurar Variáveis de Ambiente

No painel da Vercel:
1. Vá para **Settings → Environment Variables**
2. Adicione:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - \`RESEND_API_KEY\` (secreto)

### 3. Deploy

Clique em "Deploy" e aguarde a conclusão.

### 4. Domínio Personalizado (Opcional)

1. Vá para **Settings → Domains**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruído

## 🧪 Testes

### Executar Testes

\`\`\`bash
npm run test
# ou
pnpm test
\`\`\`

### Checklist de Testes Manuais

- [ ] Autenticação (registro, login, logout)
- [ ] Agendamento (todos os passos)
- [ ] Cancelamento de agendamento
- [ ] Avaliação de barbeiro
- [ ] Dashboard do barbeiro
- [ ] Painel administrativo
- [ ] E-mails de confirmação
- [ ] Responsividade mobile
- [ ] PWA (instalação e offline)

## 📚 Documentação

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Guia técnico de implementação
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribuindo

Para contribuir com melhorias:

1. Crie uma branch: \`git checkout -b feature/sua-feature\`
2. Faça commit das mudanças: \`git commit -m 'feat: adicionar nova feature'\`
3. Faça push: \`git push origin feature/sua-feature\`
4. Abra um Pull Request

## 📝 Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação em [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
2. Abra uma issue no GitHub
3. Entre em contato através do e-mail de suporte

## 🎯 Roadmap

- [ ] Notificações por WhatsApp
- [ ] Lembretes automáticos (24h antes)
- [ ] Relatórios avançados (exportar CSV)
- [ ] Integração com calendários (Google Calendar, Outlook)
- [ ] App mobile nativo (React Native)
- [ ] Múltiplas unidades de barbearia
- [ ] Sistema de cupons e promoções

---

**Desenvolvido com ❤️ para a Vivaz Barbearia Avenue**

Última atualização: Março de 2026

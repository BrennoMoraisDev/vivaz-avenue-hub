# Plano Técnico - Vivaz Avenue Hub

## 1. Experiência Mobile & PWA Avançada
- [ ] Adicionar Push Notifications (via Service Worker / Web Push)
- [ ] Melhorar Offline Mode (cache de agendamentos no localStorage/IndexedDB)
- [ ] Configurar Splash Screens no manifest.json e meta tags para iOS

## 2. Automação de Marketing & Retenção
- [ ] Criar tabela/lógica de Sistema de Fidelidade (ex: a cada 10 cortes, 1 grátis)
- [ ] Implementar Lembrete de Retorno (verificar clientes sem agendamento há > 20 dias)
- [ ] Preparar integração com WhatsApp (link direto com mensagem pré-formatada para confirmação)

## 3. Inteligência de Negócio (BI) para o Admin
- [ ] Adicionar Mapa de Calor de Horários no AdminDashboard
- [ ] Criar relatório de Cálculo Automático de Comissões detalhado
- [ ] Adicionar métrica de Ticket Médio por cliente

## 4. Refinamento de UI/UX
- [ ] Adicionar Skeletons de Carregamento nas páginas principais (substituir spinners)
- [ ] Melhorar Micro-interações com Framer Motion (já instalado)
- [ ] Implementar Dark/Light Mode (já tem next-themes, precisa configurar o toggle)

## 5. Robustez Técnica & Escalabilidade
- [ ] Configurar tratamento de erros global (Error Boundary)
- [ ] Otimizar carregamento de imagens (lazy loading)
- [ ] Adicionar testes básicos de fluxo (Playwright já está no package.json)

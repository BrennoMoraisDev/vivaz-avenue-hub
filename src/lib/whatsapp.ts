/**
 * Utilitário de integração WhatsApp
 * Gera links diretos para WhatsApp com mensagens pré-formatadas
 */

interface AgendamentoInfo {
  clienteNome: string;
  clienteTelefone: string;
  barbeiroNome: string;
  servicoNome: string;
  data: string;
  hora: string;
  barbeariaNome?: string;
  barberiaWhatsApp?: string;
}

/**
 * Formata número de telefone para padrão internacional brasileiro
 */
export function formatarTelefone(telefone: string): string {
  const nums = telefone.replace(/\D/g, '');
  // Se já tem DDI (55), retorna como está
  if (nums.startsWith('55') && nums.length >= 12) return nums;
  // Adiciona DDI Brasil
  return `55${nums}`;
}

/**
 * Formata data no padrão brasileiro
 */
function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const d = new Date(`${data}T12:00:00`);
  return `${diasSemana[d.getDay()]}, ${dia} de ${meses[parseInt(mes) - 1]}`;
}

/**
 * Gera link WhatsApp para confirmação de agendamento
 */
export function linkConfirmacaoWhatsApp(info: AgendamentoInfo): string {
  const telefone = formatarTelefone(info.clienteTelefone);
  const mensagem = `Olá, *${info.clienteNome}*! 👋

✅ *Agendamento Confirmado* na *${info.barbeariaNome || 'Vivaz Barbearia Avenue'}*

📅 *Data:* ${formatarData(info.data)}
⏰ *Horário:* ${info.hora.slice(0, 5)}
✂️ *Serviço:* ${info.servicoNome}
💈 *Barbeiro:* ${info.barbeiroNome}

_Qualquer dúvida, é só responder esta mensagem._
_Até lá! 🤙_`;

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Gera link WhatsApp para lembrete de retorno (cliente sumido)
 */
export function linkLembreteRetornoWhatsApp(
  clienteNome: string,
  clienteTelefone: string,
  diasSemVisita: number,
  barbeariaNome = 'Vivaz Barbearia Avenue'
): string {
  const telefone = formatarTelefone(clienteTelefone);
  const mensagem = `Oi, *${clienteNome}*! 👋

Faz *${diasSemVisita} dias* que não te vemos por aqui na *${barbeariaNome}* e sentimos sua falta! 😄

Que tal renovar o visual hoje? Temos horários disponíveis para você!

👉 Acesse o app e agende agora mesmo 💈

_Até breve!_`;

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Gera link WhatsApp para lembrete 1h antes do corte
 */
export function linkLembrete1HoraWhatsApp(
  clienteNome: string,
  clienteTelefone: string,
  hora: string,
  barbeiroNome: string,
  barbeariaNome = 'Vivaz Barbearia Avenue'
): string {
  const telefone = formatarTelefone(clienteTelefone);
  const mensagem = `Olá, *${clienteNome}*! ⏰

Lembrete: seu horário na *${barbeariaNome}* é *hoje às ${hora.slice(0, 5)}* com o barbeiro *${barbeiroNome}*.

Até já! ✂️`;

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Gera link WhatsApp para aviso de corte grátis disponível
 */
export function linkFidelidadeWhatsApp(
  clienteNome: string,
  clienteTelefone: string,
  barbeariaNome = 'Vivaz Barbearia Avenue'
): string {
  const telefone = formatarTelefone(clienteTelefone);
  const mensagem = `Parabéns, *${clienteNome}*! 🎉

Você completou 10 cortes na *${barbeariaNome}* e ganhou um *corte GRÁTIS*! 🎁

Venha resgatar quando quiser. Só nos avisar! 💈`;

  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Abre o WhatsApp diretamente (para uso em botões)
 */
export function abrirWhatsApp(link: string): void {
  window.open(link, '_blank', 'noopener,noreferrer');
}

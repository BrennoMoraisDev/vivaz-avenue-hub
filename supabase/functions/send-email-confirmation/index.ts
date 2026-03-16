import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend?target=deno";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EmailPayload {
  to: string;
  nome: string;
  servico: string;
  barbeiro: string;
  data: string;
  hora: string;
  endereco: string;
  whatsapp?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { to, nome, servico, barbeiro, data, hora, endereco, whatsapp } = payload;

    // Format date from YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = data.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #0A0A0A;
              color: #F5F5F5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
              background: #0A0A0A;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #D4AF37;
              font-family: 'Space Grotesk', monospace;
              margin-bottom: 20px;
            }
            .content {
              background: #1A1A1A;
              border-radius: 12px;
              padding: 30px;
              margin-bottom: 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              line-height: 1.6;
            }
            .details {
              background: #0A0A0A;
              border-left: 4px solid #D4AF37;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .detail-item {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #333;
            }
            .detail-item:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #D4AF37;
              min-width: 120px;
            }
            .detail-value {
              color: #F5F5F5;
              text-align: right;
            }
            .cta-button {
              display: inline-block;
              background: #D4AF37;
              color: #0A0A0A;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin-top: 20px;
              text-align: center;
            }
            .footer {
              text-align: center;
              color: #999;
              font-size: 14px;
              margin-top: 30px;
            }
            .contact-info {
              background: #1A1A1A;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✂️ Vivaz Barbearia Avenue</div>
            </div>

            <div class="content">
              <div class="greeting">
                Olá <strong>${nome}</strong>,
              </div>
              <p style="margin: 15px 0; line-height: 1.6;">
                Seu agendamento foi confirmado com sucesso! Estamos ansiosos para recebê-lo.
              </p>

              <div class="details">
                <div class="detail-item">
                  <span class="detail-label">Serviço:</span>
                  <span class="detail-value"><strong>${servico}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Barbeiro:</span>
                  <span class="detail-value"><strong>${barbeiro}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Data:</span>
                  <span class="detail-value"><strong>${formattedDate}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Horário:</span>
                  <span class="detail-value"><strong>${hora}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Endereço:</span>
                  <span class="detail-value"><strong>${endereco}</strong></span>
                </div>
              </div>

              <p style="margin-top: 20px; color: #CCC; font-size: 14px;">
                Caso precise remarcar ou tiver dúvidas, entre em contato conosco pelo WhatsApp:
              </p>

              <div class="contact-info">
                <p style="margin: 0; font-size: 16px;">
                  <strong>${whatsapp || "(11) 98765-4321"}</strong>
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${req.headers.get("origin")}/cliente/historico" class="cta-button">
                  Ver meus agendamentos
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Vivaz Barbearia Avenue © 2026. Todos os direitos reservados.</p>
              <p>Você recebeu este e-mail porque agendou um serviço conosco.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error } = await resend.emails.send({
      from: "Vivaz Barbearia Avenue <onboarding@resend.dev>",
      to: [to],
      subject: "Seu horário na Vivaz Barbearia Avenue foi confirmado!",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Email sent successfully",
        emailId: emailData?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

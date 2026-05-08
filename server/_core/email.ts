import { ENV } from "./env";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Enviar e-mail usando Manus Forge API (built-in email service)
 */
export async function sendEmail({ to, subject, html, from = "noreply@agendamento-seta.manus.space" }: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch(`${ENV.forgeApiUrl}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        from,
      }),
    });

    if (!response.ok) {
      console.error(`[Email] Failed to send email to ${to}:`, response.statusText);
      return false;
    }

    console.log(`[Email] Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Error sending email to ${to}:`, error);
    return false;
  }
}

/**
 * Template de e-mail para novo agendamento (representante)
 */
export function getAppointmentEmailTemplate(data: {
  clientName: string;
  clientCompany: string;
  clientPhone: string;
  clientEmail: string;
  clientCity: string;
  appointmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  representativeName: string;
}): string {
  const appointmentTypeLabel = {
    reuniao_online: "Reunião Online",
    visita_presencial: "Visita Presencial",
    ligacao: "Ligação",
  }[data.appointmentType] || data.appointmentType;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Montserrat', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #005383; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: 600; color: #005383; margin-bottom: 10px; font-size: 14px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: 500; color: #666; }
    .info-value { color: #333; }
    .button { display: inline-block; background-color: #005383; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Novo Agendamento Recebido</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.representativeName}</strong>,</p>
      
      <p>Um novo agendamento foi solicitado através do seu link personalizado. Confira os detalhes abaixo:</p>

      <div class="section">
        <div class="section-title">DADOS DO CLIENTE</div>
        <div class="info-row">
          <span class="info-label">Nome:</span>
          <span class="info-value">${data.clientName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Empresa:</span>
          <span class="info-value">${data.clientCompany || "—"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Telefone/WhatsApp:</span>
          <span class="info-value">${data.clientPhone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">E-mail:</span>
          <span class="info-value">${data.clientEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cidade:</span>
          <span class="info-value">${data.clientCity || "—"}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">DETALHES DO AGENDAMENTO</div>
        <div class="info-row">
          <span class="info-label">Tipo:</span>
          <span class="info-value">${appointmentTypeLabel}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Data:</span>
          <span class="info-value">${new Date(data.appointmentDate).toLocaleDateString("pt-BR")}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Horário:</span>
          <span class="info-value">${data.appointmentTime}</span>
        </div>
      </div>

      ${data.notes ? `
      <div class="section">
        <div class="section-title">OBSERVAÇÕES</div>
        <p>${data.notes.replace(/\n/g, "<br>")}</p>
      </div>
      ` : ""}

      <p>Acesse o painel de controle para confirmar ou gerenciar este agendamento.</p>
      
      <div class="footer">
        <p>Este é um e-mail automático do sistema Agendamento Seta. Por favor, não responda este e-mail.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Template de e-mail para confirmação de agendamento (cliente)
 */
export function getConfirmationEmailTemplate(data: {
  clientName: string;
  appointmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  representativeName: string;
}): string {
  const appointmentTypeLabel = {
    reuniao_online: "Reunião Online",
    visita_presencial: "Visita Presencial",
    ligacao: "Ligação",
  }[data.appointmentType] || data.appointmentType;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Montserrat', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #005383; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
    .success-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: 500; color: #666; }
    .info-value { color: #333; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Agendamento Confirmado!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.clientName}</strong>,</p>
      
      <div class="success-box">
        <p>Seu agendamento foi recebido com sucesso! Você receberá uma confirmação final em breve.</p>
      </div>

      <p>Aqui estão os detalhes do seu agendamento:</p>

      <div class="info-row">
        <span class="info-label">Tipo de Atendimento:</span>
        <span class="info-value">${appointmentTypeLabel}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Data:</span>
        <span class="info-value">${new Date(data.appointmentDate).toLocaleDateString("pt-BR")}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Horário:</span>
        <span class="info-value">${data.appointmentTime}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Representante:</span>
        <span class="info-value">${data.representativeName}</span>
      </div>

      <p style="margin-top: 20px;">Nosso representante entrará em contato para confirmar o agendamento. Obrigado por escolher a Seta Embalagens!</p>
      
      <div class="footer">
        <p>Este é um e-mail automático do sistema Agendamento Seta. Por favor, não responda este e-mail.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

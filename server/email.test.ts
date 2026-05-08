import { describe, it, expect } from "vitest";
import { getAppointmentEmailTemplate, getConfirmationEmailTemplate } from "./_core/email";

describe("Email Templates", () => {
  it("should generate appointment email for representative", () => {
    const html = getAppointmentEmailTemplate({
      clientName: "João Silva",
      clientCompany: "Empresa XYZ",
      clientPhone: "(11) 99999-9999",
      clientEmail: "joao@example.com",
      clientCity: "São Paulo",
      appointmentType: "reuniao_online",
      appointmentDate: "2026-05-15",
      appointmentTime: "14:00",
      notes: "Teste de agendamento",
      representativeName: "Maria Santos",
    });

    expect(html).toContain("João Silva");
    expect(html).toContain("Empresa XYZ");
    expect(html).toContain("(11) 99999-9999");
    expect(html).toContain("joao@example.com");
    expect(html).toContain("Reunião Online");
    expect(html).toContain("14:00");
    expect(html).toContain("Maria Santos");
    expect(html).toContain("Novo Agendamento Recebido");
  });

  it("should generate confirmation email for client", () => {
    const html = getConfirmationEmailTemplate({
      clientName: "João Silva",
      appointmentType: "visita_presencial",
      appointmentDate: "2026-05-15",
      appointmentTime: "14:00",
      representativeName: "Maria Santos",
    });

    expect(html).toContain("João Silva");
    expect(html).toContain("Visita Presencial");
    expect(html).toContain("14:00");
    expect(html).toContain("Maria Santos");
    expect(html).toContain("Agendamento Confirmado");
  });

  it("should handle optional fields in appointment email", () => {
    const html = getAppointmentEmailTemplate({
      clientName: "João Silva",
      clientCompany: "",
      clientPhone: "(11) 99999-9999",
      clientEmail: "joao@example.com",
      clientCity: "",
      appointmentType: "ligacao",
      appointmentDate: "2026-05-15",
      appointmentTime: "14:00",
      representativeName: "Maria Santos",
    });

    expect(html).toContain("João Silva");
    expect(html).toContain("Ligação");
    expect(html).toContain("—"); // Empty fields show dash
  });

  it("should format appointment date correctly", () => {
    const html = getConfirmationEmailTemplate({
      clientName: "João Silva",
      appointmentType: "reuniao_online",
      appointmentDate: "2026-05-15",
      appointmentTime: "10:00",
      representativeName: "Maria Santos",
    });

    // Date should be formatted in Portuguese locale
    expect(html).toContain("2026");
    expect(html).toContain("10:00");
  });

  it("should handle notes with line breaks", () => {
    const html = getAppointmentEmailTemplate({
      clientName: "João Silva",
      clientCompany: "Empresa XYZ",
      clientPhone: "(11) 99999-9999",
      clientEmail: "joao@example.com",
      clientCity: "São Paulo",
      appointmentType: "reuniao_online",
      appointmentDate: "2026-05-15",
      appointmentTime: "14:00",
      notes: "Linha 1\nLinha 2\nLinha 3",
      representativeName: "Maria Santos",
    });

    expect(html).toContain("Linha 1<br>Linha 2<br>Linha 3");
  });
});

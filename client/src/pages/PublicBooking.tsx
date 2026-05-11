import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarPicker } from "@/components/CalendarPicker";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { format } from "date-fns";

type BookingStep = "form" | "calendar" | "confirmation";

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  
  // Não processar rotas especiais como /404, /admin, /representante
  // Remove query strings para verificação (ex: "404?from_webdev=1" -> "404")
  const cleanSlug = slug?.split("?")[0] || "";
  if (cleanSlug === "404" || cleanSlug === "admin" || cleanSlug === "representante") {
    return null; // Deixar wouter rotear para o componente correto
  }

  const [step, setStep] = useState<BookingStep>("form");
  const [formData, setFormData] = useState({
    clientName: "",
    clientCompany: "",
    clientPhone: "",
    clientEmail: "",
    clientCity: "",
    appointmentType: "reuniao_online",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar link pelo slug (remove query strings)
  const { data: link, isLoading: linkLoading, error: linkError } = trpc.links.getBySlug.useQuery(
    { slug: cleanSlug },
    { enabled: !!cleanSlug }
  );

  // Criar agendamento mutation
  const createAppointmentMutation = trpc.appointments.create.useMutation();

  useEffect(() => {
    if (linkError || (linkLoading === false && !link)) {
      navigate("/404");
    }
  }, [link, linkLoading, linkError, navigate]);

  if (linkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando formulário de agendamento...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Link de agendamento inválido ou expirado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setStep("calendar");
  };

  const handleDateTimeSelect = async (date: string, time: string) => {
    setIsSubmitting(true);
    try {
      const selectedDate = new Date(date);

      await createAppointmentMutation.mutateAsync({
        representativeId: link.representativeId,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientCompany: formData.clientCompany,
        clientCity: formData.clientCity,
        appointmentType: formData.appointmentType as "reuniao_online" | "visita_presencial" | "ligacao",
        appointmentDate: date,
        appointmentTime: time,
        notes: formData.notes,
      });

      toast.success("Agendamento realizado com sucesso!");
      setStep("confirmation");
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast.error("Erro ao criar agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">Seta Embalagens</h1>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Agendar Reunião
          </h2>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para agendar sua reunião
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {step === "form" && (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={formData.clientCompany}
                      onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.clientCity}
                      onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Atendimento *</Label>
                    <Select value={formData.appointmentType} onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reuniao_online">Reunião Online</SelectItem>
                        <SelectItem value="visita_presencial">Visita Presencial</SelectItem>
                        <SelectItem value="ligacao">Ligação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Deixe suas observações ou dúvidas..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Próximo: Selecionar Data e Hora
                </Button>
              </form>
            )}

            {step === "calendar" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Selecione Data e Hora</h3>
                  <CalendarPicker
                    onDateTimeSelect={handleDateTimeSelect}
                    isLoading={isSubmitting}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep("form")}
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
              </div>
            )}

            {step === "confirmation" && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
                    <CheckCircle2 className="relative h-16 w-16 text-green-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Agendamento Confirmado!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Um email de confirmação foi enviado para {formData.clientEmail}
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 text-left space-y-2 text-sm">
                    <p><strong>Nome:</strong> {formData.clientName}</p>
                    <p><strong>Empresa:</strong> {formData.clientCompany || "Não informado"}</p>
                    <p><strong>Telefone:</strong> {formData.clientPhone}</p>
                    <p><strong>Tipo:</strong> {formData.appointmentType === "reuniao_online" ? "Reunião Online" : formData.appointmentType === "visita_presencial" ? "Visita Presencial" : "Ligação"}</p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = "/"}
                  className="w-full"
                  size="lg"
                >
                  Voltar para Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

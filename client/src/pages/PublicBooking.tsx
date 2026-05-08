import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type BookingStep = "form" | "calendar" | "confirmation";

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
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

  // Buscar link pelo slug
  const { data: link, isLoading: linkLoading, error: linkError } = trpc.links.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  useEffect(() => {
    if (linkError || (linkLoading === false && !link)) {
      navigate("/404");
    }
  }, [link, linkLoading, linkError, navigate]);

  if (linkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                O link de agendamento não foi encontrado ou não está mais disponível.
              </AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => navigate("/")}>
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar formulário
    if (!formData.clientName || !formData.clientPhone || !formData.clientEmail) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    setStep("calendar");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-8">
      {/* Header */}
      <div className="container mb-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-primary">Agendamento Seta</span>
        </div>
      </div>

      <div className="container max-w-2xl">
        {step === "form" && (
          <Card>
            <CardHeader>
              <CardTitle>Agende uma Reunião</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Preencha os dados abaixo para agendar uma reunião com nosso representante
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>

                {/* Empresa */}
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    placeholder="Nome da sua empresa"
                    value={formData.clientCompany}
                    onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp/Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    required
                  />
                </div>

                {/* Cidade */}
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="São Paulo"
                    value={formData.clientCity}
                    onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
                  />
                </div>

                {/* Tipo de Atendimento */}
                <div className="space-y-2">
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

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Deixe aqui alguma informação adicional sobre sua demanda"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Continuar para Agendamento
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "calendar" && (
          <Card>
            <CardHeader>
              <CardTitle>Selecione Data e Horário</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Escolha a data e horário mais conveniente para você
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Calendário de disponibilidade em desenvolvimento...
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("form")}>
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "confirmation" && (
          <Card>
            <CardHeader>
              <CardTitle>Agendamento Confirmado!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Seu agendamento foi solicitado com sucesso! Nosso representante entrará em contato para confirmar.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/")}>
                Voltar para Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

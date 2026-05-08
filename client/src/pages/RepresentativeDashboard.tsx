import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Link2, Clock, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function RepresentativeDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: link } = trpc.links.getMe.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "representante",
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "representante") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== "representante") {
    return null;
  }

  const bookingUrl = link?.slug ? `${window.location.origin}/${link.slug}` : "";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus agendamentos e compartilhe seu link personalizado
          </p>
        </div>

        {/* Link Personalizado */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Seu Link de Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookingUrl ? (
              <>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Link único para compartilhar:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bookingUrl}
                      readOnly
                      className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(bookingUrl);
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Compartilhe este link com seus clientes para que eles possam agendar reuniões com você.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Carregando seu link...</p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total de agendamentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Já confirmados</p>
            </CardContent>
          </Card>
        </div>

        {/* Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhum agendamento ainda. Quando clientes agendarem através do seu link, aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

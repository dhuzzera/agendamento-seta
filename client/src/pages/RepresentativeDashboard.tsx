import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BookingLinkCard } from "@/components/BookingLinkCard";

export default function RepresentativeDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirecionar se nao for representante
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "representante") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const { data: link, isLoading: linkLoading } = trpc.links.getMe.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "representante",
  });

  const stats = useMemo(() => ({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  }), []);

  // Nao renderizar enquanto redireciona
  if (!isAuthenticated || user?.role !== "representante") {
    return null;
  }

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
        <BookingLinkCard slug={link?.slug} isLoading={linkLoading} />

        {/* Stats - apenas 3 cards para representante */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total de agendamentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
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

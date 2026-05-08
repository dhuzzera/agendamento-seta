import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AppointmentStats } from "@/components/AppointmentStats";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirecionar se nao for admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const stats = useMemo(() => ({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  }), []);

  // Nao renderizar enquanto redireciona
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao painel de administração do Agendamento Seta
          </p>
        </div>

        {/* Stats */}
        <AppointmentStats data={stats} />

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhum agendamento ainda. Quando representantes criarem agendamentos, aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2, X, Edit2, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BookingLinkCard } from "@/components/BookingLinkCard";
import { DateBlockageManager } from "@/components/DateBlockageManager";
import { CalDAVConnection } from "@/components/CalDAVConnection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RepresentativeDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [interval, setInterval] = useState(30);

  // Redirecionar se nao for representante
  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "representante" && user?.role !== "admin")) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Carregar dados
  const { data: link, isLoading: linkLoading } = trpc.links.getMe.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "representante" || user?.role === "admin"),
  });

  const { data: appointments = [] } = trpc.appointments.list.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "representante" || user?.role === "admin"),
  });

  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter(a => a.status === "pendente").length,
    confirmed: appointments.filter(a => a.status === "confirmado").length,
    cancelled: appointments.filter(a => a.status === "cancelado").length,
  }), [appointments]);

  const handleCopyLink = () => {
    if (link?.slug) {
      const fullUrl = `${window.location.origin}/${link.slug}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updateAvailabilityMutation = trpc.availability.create.useMutation({
    onSuccess: () => {
      toast.success("Disponibilidade atualizada com sucesso!");
      setShowAvailabilityDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar disponibilidade");
    },
  });

  const updateStatusMutation = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      trpc.useUtils().appointments.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  // Nao renderizar enquanto redireciona
  if (!isAuthenticated || (user?.role !== "representante" && user?.role !== "admin")) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Representante</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus agendamentos e compartilhe seu link personalizado
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* TAB 1: Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Link Personalizado */}
            <BookingLinkCard slug={link?.slug} isLoading={linkLoading} />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Todos os agendamentos</p>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                  <X className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.cancelled}</div>
                  <p className="text-xs text-muted-foreground">Cancelados</p>
                </CardContent>
              </Card>
            </div>

            {/* Link para compartilhar */}
            <Card>
              <CardHeader>
                <CardTitle>Seu Link Personalizado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {link?.slug ? (
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/${link.slug}`}
                      className="bg-muted"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="icon"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Gerando seu link personalizado...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Agendamentos */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meus Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum agendamento ainda. Quando clientes agendarem através do seu link, aparecerão aqui.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((apt: any) => (
                          <TableRow key={apt.id}>
                            <TableCell className="font-medium">{apt.clientName}</TableCell>
                            <TableCell>{apt.clientEmail}</TableCell>
                            <TableCell>{apt.clientPhone}</TableCell>
                            <TableCell>
                              {new Date(apt.appointmentDate).toLocaleDateString("pt-BR")} às{" "}
                              {apt.appointmentTime}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  apt.status === "confirmado"
                                    ? "bg-green-100 text-green-800"
                                    : apt.status === "pendente"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {apt.status === "confirmado"
                                  ? "Confirmado"
                                  : apt.status === "pendente"
                                  ? "Pendente"
                                  : "Cancelado"}
                              </span>
                            </TableCell>
                            <TableCell className="space-x-2">
                              {apt.status === "pendente" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        appointmentId: apt.id,
                                        status: "confirmado",
                                      })
                                    }
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        appointmentId: apt.id,
                                        status: "cancelado",
                                      })
                                    }
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurar Disponibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
                  <DialogTrigger asChild>
                    <Button>Configurar Horários</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configurar Disponibilidade</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Horário de Início</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">Horário de Término</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interval">Intervalo (minutos)</Label>
                        <Input
                          id="interval"
                          type="number"
                          value={interval}
                          onChange={(e) => setInterval(parseInt(e.target.value))}
                          min="15"
                          max="120"
                          step="15"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (user?.id) {
                            updateAvailabilityMutation.mutate({
                              representativeId: user.id,
                              dayOfWeek: 1,
                              startTime,
                              endTime,
                              intervalMinutes: interval,
                            });
                          }
                        }}
                        disabled={updateAvailabilityMutation.isPending}
                        className="w-full"
                      >
                        Salvar Configurações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bloquear Datas</CardTitle>
              </CardHeader>
              <CardContent>
                <DateBlockageManager representativeId={user?.id || 0} />
              </CardContent>
            </Card>

            <CalDAVConnection />

            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Conta</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

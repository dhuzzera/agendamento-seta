import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { AppointmentStats } from "@/components/AppointmentStats";
import { Plus, Edit2, Trash2, Calendar, Users, Settings } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Redirecionar se nao for admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

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

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="representatives" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Representantes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <AppointmentStats data={{
              total: 0,
              pending: 0,
              confirmed: 0,
              cancelled: 0,
            }} />
            
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Nenhum agendamento ainda. Os agendamentos aparecerão aqui quando clientes criarem via links personalizados.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Agendamentos */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gerenciar Agendamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="filter-rep">Representante</Label>
                    <Select>
                      <SelectTrigger id="filter-rep">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="filter-status">Status</Label>
                    <Select>
                      <SelectTrigger id="filter-status">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="filter-date">Data</Label>
                    <Input id="filter-date" type="date" />
                  </div>
                </div>

                {/* Tabela */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Representante</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum agendamento encontrado
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Representantes */}
          <TabsContent value="representatives" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gerenciar Representantes</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Novo Representante
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Representante</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rep-name">Nome</Label>
                        <Input id="rep-name" placeholder="Nome do representante" />
                      </div>
                      <div>
                        <Label htmlFor="rep-email">Email</Label>
                        <Input id="rep-email" type="email" placeholder="email@example.com" />
                      </div>
                      <div>
                        <Label htmlFor="rep-phone">Telefone</Label>
                        <Input id="rep-phone" placeholder="(11) 99999-9999" />
                      </div>
                      <Button className="w-full">Criar Representante</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum representante cadastrado
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Globais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Horários Disponíveis */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Horários Disponíveis Padrão</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure os horários padrão que serão oferecidos aos clientes
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                      <Button key={time} variant="outline" className="w-full">
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bloqueios de Data */}
                <div className="space-y-3 border-t pt-6">
                  <h3 className="font-semibold">Bloquear Datas</h3>
                  <p className="text-sm text-muted-foreground">
                    Bloqueie datas específicas para que não apareçam no calendário
                  </p>
                  <div className="flex gap-2">
                    <Input type="date" placeholder="Selecione uma data" />
                    <Button>Bloquear</Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Datas Bloqueadas:</p>
                    <p className="text-sm text-muted-foreground">Nenhuma data bloqueada</p>
                  </div>
                </div>

                {/* Intervalo de Agendamento */}
                <div className="space-y-3 border-t pt-6">
                  <h3 className="font-semibold">Intervalo de Agendamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Defina o intervalo entre agendamentos (em minutos)
                  </p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor="interval">Intervalo (minutos)</Label>
                      <Input id="interval" type="number" placeholder="30" defaultValue="30" />
                    </div>
                    <Button>Salvar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export function PerformanceDashboard() {
  // Carregar todos os agendamentos
  const { data: appointments = [] } = trpc.appointments.list.useQuery();
  
  // Carregar representantes
  const { data: representatives = [] } = trpc.representatives.list.useQuery();

  // Calcular métricas
  const metrics = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a: any) => a.status === "confirmado").length;
    const pending = appointments.filter((a: any) => a.status === "pendente").length;
    const cancelled = appointments.filter((a: any) => a.status === "cancelado").length;
    const completed = appointments.filter((a: any) => a.status === "concluido").length;

    const confirmationRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    // Representante mais ativo
    const representativeStats: { [key: number]: { name: string; count: number } } = {};
    appointments.forEach((apt: any) => {
      if (!representativeStats[apt.representativeId]) {
        const rep = representatives.find((r: any) => r.id === apt.representativeId);
        representativeStats[apt.representativeId] = {
          name: rep?.userId ? `Representante ${rep.id}` : "Desconhecido",
          count: 0,
        };
      }
      representativeStats[apt.representativeId].count++;
    });

    const topRepresentative = Object.values(representativeStats).sort((a, b) => b.count - a.count)[0] || { name: "—", count: 0 };

    // Horários mais procurados
    const timeSlots: { [key: string]: number } = {};
    appointments.forEach((apt: any) => {
      const time = apt.appointmentTime;
      timeSlots[time] = (timeSlots[time] || 0) + 1;
    });

    const topTimeSlots = Object.entries(timeSlots)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([time, count]) => ({ time, count }));

    // Tipos de agendamento
    const appointmentTypes: { [key: string]: number } = {};
    appointments.forEach((apt: any) => {
      const type = apt.appointmentType;
      appointmentTypes[type] = (appointmentTypes[type] || 0) + 1;
    });

    const appointmentTypeData = Object.entries(appointmentTypes).map(([type, count]) => ({
      name: type === "reuniao_online" ? "Reunião Online" : type === "visita_presencial" ? "Visita Presencial" : "Ligação",
      value: count,
    }));

    // Tendência por status
    const statusData = [
      { name: "Confirmado", value: confirmed, fill: "#10b981" },
      { name: "Pendente", value: pending, fill: "#f59e0b" },
      { name: "Cancelado", value: cancelled, fill: "#ef4444" },
      { name: "Concluído", value: completed, fill: "#3b82f6" },
    ];

    // Agendamentos por representante (top 5)
    const representativeData = Object.entries(representativeStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([_, data]) => ({
        name: data.name,
        agendamentos: data.count,
      }));

    // Tendência de agendamentos por dia (últimos 30 dias)
    const trendData: { [key: string]: number } = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, "dd/MM");
      trendData[dateStr] = 0;
    }
    
    appointments.forEach((apt: any) => {
      const aptDate = new Date(apt.appointmentDate);
      const dateStr = format(aptDate, "dd/MM");
      if (trendData.hasOwnProperty(dateStr)) {
        trendData[dateStr]++;
      }
    });

    const trendChartData = Object.entries(trendData).map(([date, count]) => ({
      date,
      agendamentos: count,
    }));

    return {
      total,
      confirmed,
      pending,
      cancelled,
      completed,
      confirmationRate,
      topRepresentative,
      topTimeSlots,
      appointmentTypeData,
      statusData,
      representativeData,
      trendChartData,
    };
  }, [appointments, representatives]);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">Todos os agendamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Confirmação</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.confirmationRate}%</div>
            <p className="text-xs text-muted-foreground">{metrics.confirmed} confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Representante Top</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topRepresentative.name}</div>
            <p className="text-xs text-muted-foreground">{metrics.topRepresentative.count} agendamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horário Top</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topTimeSlots[0]?.time || "—"}</div>
            <p className="text-xs text-muted-foreground">{metrics.topTimeSlots[0]?.count || 0} agendamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Types */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.appointmentTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Representantes e Horários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Representatives */}
        <Card>
          <CardHeader>
            <CardTitle>Representantes Mais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.representativeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="agendamentos" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Horários Mais Procurados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.topTimeSlots}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendência de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Agendamentos (Últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="agendamentos" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumo Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{metrics.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{metrics.confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{metrics.pending}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{metrics.cancelled}</p>
              <p className="text-sm text-muted-foreground">Cancelados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{metrics.completed}</p>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

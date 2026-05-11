import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterRepresentative, setFilterRepresentative] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Carregar todos os agendamentos
  const { data: appointments = [] } = trpc.appointments.list.useQuery();
  
  // Carregar representantes
  const { data: representatives = [] } = trpc.representatives.list.useQuery();

  // Gerar dias do mês
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filtrar agendamentos
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt: any) => {
      if (filterRepresentative !== "all" && apt.representativeId !== parseInt(filterRepresentative)) {
        return false;
      }
      if (filterStatus !== "all" && apt.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [appointments, filterRepresentative, filterStatus]);

  // Agrupar agendamentos filtrados por data
  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    filteredAppointments.forEach((apt: any) => {
      const dateStr = format(new Date(apt.appointmentDate), "yyyy-MM-dd");
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(apt);
    });
    return grouped;
  }, [filteredAppointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      case "concluido":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleClearFilters = () => {
    setFilterRepresentative("all");
    setFilterStatus("all");
  };

  // Contar agendamentos por representante
  const representativeCount = useMemo(() => {
    const count: { [key: number]: number } = {};
    appointments.forEach((apt: any) => {
      count[apt.representativeId] = (count[apt.representativeId] || 0) + 1;
    });
    return count;
  }, [appointments]);

  // Contar agendamentos por status
  const statusCount = useMemo(() => {
    const count: { [key: string]: number } = {};
    appointments.forEach((apt: any) => {
      count[apt.status] = (count[apt.status] || 0) + 1;
    });
    return count;
  }, [appointments]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filtros</CardTitle>
          {(filterRepresentative !== "all" || filterStatus !== "all") && (
            <Button size="sm" variant="outline" onClick={handleClearFilters} className="gap-2">
              <X className="w-4 h-4" />
              Limpar Filtros
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Representante</label>
              <Select value={filterRepresentative} onValueChange={setFilterRepresentative}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({appointments.length})</SelectItem>
                  {representatives.map((rep: any) => (
                    <SelectItem key={rep.id} value={rep.id.toString()}>
                      Representante {rep.id} ({representativeCount[rep.id] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({appointments.length})</SelectItem>
                  <SelectItem value="pendente">Pendente ({statusCount["pendente"] || 0})</SelectItem>
                  <SelectItem value="confirmado">Confirmado ({statusCount["confirmado"] || 0})</SelectItem>
                  <SelectItem value="cancelado">Cancelado ({statusCount["cancelado"] || 0})</SelectItem>
                  <SelectItem value="concluido">Concluído ({statusCount["concluido"] || 0})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredAppointments.length} de {appointments.length} agendamentos
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Calendário de Agendamentos</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" disabled>
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </Button>
            <Button size="sm" variant="outline" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cabeçalho com dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayAppointments = appointmentsByDate[dateStr] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dateStr}
                  className={`min-h-24 p-2 border rounded-lg ${
                    isCurrentMonth ? "bg-white" : "bg-gray-50"
                  } ${isToday ? "border-primary border-2" : "border-gray-200"}`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.map((apt: any) => (
                      <button
                        key={apt.id}
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setShowDetails(true);
                        }}
                        className={`text-xs p-1 rounded w-full text-left truncate cursor-pointer hover:opacity-80 ${getStatusColor(apt.status)}`}
                        title={`${apt.clientName} - ${apt.appointmentTime}`}
                      >
                        {apt.appointmentTime} {apt.clientName.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-semibold">{selectedAppointment.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{selectedAppointment.clientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-semibold">{selectedAppointment.clientPhone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data e Hora</p>
                <p className="font-semibold">
                  {format(new Date(selectedAppointment.appointmentDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedAppointment.appointmentTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-semibold">
                  {selectedAppointment.appointmentType === "reuniao_online" ? "Reunião Online" :
                   selectedAppointment.appointmentType === "visita_presencial" ? "Visita Presencial" : "Ligação"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              {selectedAppointment.clientCompany && (
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-semibold">{selectedAppointment.clientCompany}</p>
                </div>
              )}
              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-semibold">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

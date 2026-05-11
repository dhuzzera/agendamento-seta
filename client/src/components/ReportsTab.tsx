import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ReportsTab() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Carregar todos os agendamentos
  const { data: appointments = [] } = trpc.appointments.list.useQuery();

  // Filtrar agendamentos
  const filteredAppointments = appointments.filter((apt: any) => {
    if (dateFrom && new Date(apt.appointmentDate) < new Date(dateFrom)) return false;
    if (dateTo && new Date(apt.appointmentDate) > new Date(dateTo)) return false;
    if (status !== "all" && apt.status !== status) return false;
    return true;
  });

  // Exportar para CSV
  const handleExportCSV = () => {
    if (filteredAppointments.length === 0) {
      toast.error("Nenhum agendamento para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const headers = ["ID", "Cliente", "Email", "Telefone", "Empresa", "Cidade", "Tipo", "Data", "Horário", "Status", "Criado em"];
      const rows = filteredAppointments.map((apt: any) => [
        apt.id,
        apt.clientName,
        apt.clientEmail,
        apt.clientPhone,
        apt.clientCompany || "",
        apt.clientCity || "",
        apt.appointmentType,
        new Date(apt.appointmentDate).toLocaleDateString("pt-BR"),
        apt.appointmentTime,
        apt.status,
        new Date(apt.createdAt).toLocaleDateString("pt-BR"),
      ]);

      const csv = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `agendamentos_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Relatório CSV exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  // Exportar para PDF
  const handleExportPDF = () => {
    if (filteredAppointments.length === 0) {
      toast.error("Nenhum agendamento para exportar");
      return;
    }

    setIsExporting(true);
    try {
      // Criar HTML para PDF
      const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Agendamentos</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #005383; text-align: center; margin-bottom: 10px; }
            .info { text-align: center; color: #666; margin-bottom: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #005383; color: white; padding: 10px; text-align: left; font-size: 12px; }
            td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-top: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 4px; }
            .footer { margin-top: 30px; text-align: center; color: #999; font-size: 10px; }
          </style>
        </head>
        <body>
          <h1>Relatório de Agendamentos - Seta Embalagens</h1>
          <div class="info">
            <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
            <p>Total de agendamentos: ${filteredAppointments.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAppointments.map((apt: any) => `
                <tr>
                  <td>${apt.clientName}</td>
                  <td>${apt.clientEmail}</td>
                  <td>${apt.clientPhone}</td>
                  <td>${apt.clientCompany || "—"}</td>
                  <td>${apt.appointmentType === "reuniao_online" ? "Reunião Online" : apt.appointmentType === "visita_presencial" ? "Visita Presencial" : "Ligação"}</td>
                  <td>${new Date(apt.appointmentDate).toLocaleDateString("pt-BR")}</td>
                  <td>${apt.appointmentTime}</td>
                  <td>${apt.status}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="summary">
            <h3>Resumo</h3>
            <p>Total: ${filteredAppointments.length}</p>
            <p>Pendentes: ${filteredAppointments.filter((a: any) => a.status === "pendente").length}</p>
            <p>Confirmados: ${filteredAppointments.filter((a: any) => a.status === "confirmado").length}</p>
            <p>Cancelados: ${filteredAppointments.filter((a: any) => a.status === "cancelado").length}</p>
            <p>Concluídos: ${filteredAppointments.filter((a: any) => a.status === "concluido").length}</p>
          </div>

          <div class="footer">
            <p>Este relatório foi gerado automaticamente pelo sistema Agendamento Seta</p>
          </div>
        </body>
        </html>
      `;

      // Usar a API de PDF do navegador
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }

      toast.success("Relatório PDF pronto para impressão!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-from">Data Inicial</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date-to">Data Final</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setStatus("all");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos Encontrados: {filteredAppointments.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum agendamento encontrado com os filtros selecionados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Cliente</th>
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Data</th>
                    <th className="text-left py-2 px-4">Horário</th>
                    <th className="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt: any) => (
                    <tr key={apt.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{apt.clientName}</td>
                      <td className="py-2 px-4">{apt.clientEmail}</td>
                      <td className="py-2 px-4">{new Date(apt.appointmentDate).toLocaleDateString("pt-BR")}</td>
                      <td className="py-2 px-4">{apt.appointmentTime}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          apt.status === "confirmado" ? "bg-green-100 text-green-800" :
                          apt.status === "cancelado" ? "bg-red-100 text-red-800" :
                          apt.status === "concluido" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exportar */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatório</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            onClick={handleExportCSV}
            disabled={isExporting || filteredAppointments.length === 0}
            className="gap-2"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Exportar CSV
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting || filteredAppointments.length === 0}
            className="gap-2"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Exportar PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

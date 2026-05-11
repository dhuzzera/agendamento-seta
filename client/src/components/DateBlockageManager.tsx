import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateBlockageManagerProps {
  representativeId: number;
}

export function DateBlockageManager({ representativeId }: DateBlockageManagerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const utils = trpc.useUtils();
  const [blockedDate, setBlockedDate] = useState("");
  const [reason, setReason] = useState("");

  // Carregar bloqueios de datas
  const { data: blockages = [], isLoading } = trpc.dateBlockages.list.useQuery(
    { representativeId },
    { enabled: representativeId > 0 }
  );

  // Criar bloqueio
  const createMutation = trpc.dateBlockages.create.useMutation({
    onSuccess: () => {
      toast.success("Data bloqueada com sucesso!");
      setBlockedDate("");
      setReason("");
      setShowDialog(false);
      utils.dateBlockages.list.invalidate({ representativeId });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao bloquear data");
    },
  });

  // Deletar bloqueio
  const deleteMutation = trpc.dateBlockages.delete.useMutation({
    onSuccess: () => {
      toast.success("Bloqueio removido com sucesso!");
      utils.dateBlockages.list.invalidate({ representativeId });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover bloqueio");
    },
  });

  const handleCreate = () => {
    if (!blockedDate) {
      toast.error("Selecione uma data");
      return;
    }

    createMutation.mutate({
      representativeId,
      blockedDate,
      reason: reason || undefined,
    });
  };

  // Ordenar bloqueios por data (mais próximos primeiro)
  const sortedBlockages = useMemo(() => {
    return [...blockages].sort((a, b) => {
      const dateA = new Date(a.blockedDate).getTime();
      const dateB = new Date(b.blockedDate).getTime();
      return dateA - dateB;
    });
  }, [blockages]);

  return (
    <div className="space-y-4">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Bloquear Nova Data
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blocked-date">Data *</Label>
              <Input
                id="blocked-date"
                type="date"
                value={blockedDate}
                onChange={(e) => setBlockedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Férias, evento, manutenção..."
                rows={3}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !blockedDate}
              className="w-full"
            >
              {createMutation.isPending ? "Bloqueando..." : "Bloquear Data"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-4">Carregando bloqueios...</p>
      ) : sortedBlockages.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          Nenhuma data bloqueada. Clique em "Bloquear Nova Data" para começar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="w-12">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBlockages.map((blockage) => (
                <TableRow key={blockage.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(blockage.blockedDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {blockage.reason || "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate({ blockageId: blockage.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

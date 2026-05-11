import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Calendar, Smartphone } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function CalDAVConnection() {
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Get CalDAV credentials
  const { data: credentials, isLoading, error } = trpc.caldav.getCredentials.useQuery();

  const handleCopyUrl = () => {
    if (credentials?.url) {
      navigator.clipboard.writeText(credentials.url);
      setCopied(true);
      toast.success("URL copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUsername = () => {
    if (credentials?.username) {
      navigator.clipboard.writeText(credentials.username);
      toast.success("Usuário copiado!");
    }
  };

  const handleCopyPassword = () => {
    if (credentials?.password) {
      navigator.clipboard.writeText(credentials.password);
      toast.success("Senha copiada!");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sincronizar Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sincronizar Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Erro ao carregar credenciais CalDAV</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sincronizar Calendário
        </CardTitle>
        <CardDescription>
          Conecte seu calendário do celular (Google Calendar, Outlook, Apple Calendar, etc)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CalDAV Credentials */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">URL do Calendário</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={credentials?.url || ""}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Usuário</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={credentials?.username || ""}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUsername}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Senha</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={credentials?.password || ""}
                readOnly
                type="password"
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyPassword}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Smartphone className="h-4 w-4 mr-2" />
              Como Conectar no Celular?
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Como Sincronizar seu Calendário</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Google Calendar */}
              <div>
                <h3 className="font-semibold mb-2">📱 Google Calendar (Android/iOS)</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Abra o Google Calendar</li>
                  <li>Toque em "Configurações" (engrenagem)</li>
                  <li>Selecione "Adicionar calendário" → "Inscrever-se em calendário"</li>
                  <li>Cole a URL acima e toque em "Inscrever"</li>
                  <li>Seus agendamentos aparecerão automaticamente</li>
                </ol>
              </div>

              {/* Apple Calendar */}
              <div>
                <h3 className="font-semibold mb-2">🍎 Apple Calendar (iPhone/iPad)</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Abra o Calendário</li>
                  <li>Toque em "Calendários" (abaixo)</li>
                  <li>Toque em "+" → "Adicionar calendário"</li>
                  <li>Selecione "CalDAV"</li>
                  <li>Preencha: URL, Usuário e Senha acima</li>
                  <li>Toque em "Próximo" e "Concluído"</li>
                </ol>
              </div>

              {/* Outlook */}
              <div>
                <h3 className="font-semibold mb-2">📧 Outlook (Android/iOS)</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Abra o Outlook</li>
                  <li>Toque em "Calendário"</li>
                  <li>Toque em "+" → "Adicionar calendário"</li>
                  <li>Selecione "Outro calendário" → "CalDAV"</li>
                  <li>Preencha os dados acima</li>
                </ol>
              </div>

              {/* Samsung Calendar */}
              <div>
                <h3 className="font-semibold mb-2">📅 Samsung Calendar (Android)</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Abra o Calendário Samsung</li>
                  <li>Toque em "+" → "Adicionar calendário"</li>
                  <li>Selecione "Calendário de Rede"</li>
                  <li>Cole a URL acima</li>
                  <li>Preencha Usuário e Senha</li>
                </ol>
              </div>

              <Alert>
                <AlertDescription>
                  💡 Os agendamentos sincronizam automaticamente a cada hora. Alterações aparecem em tempo real após sincronização.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>

        <Alert>
          <AlertDescription>
            ✅ Seus agendamentos serão sincronizados automaticamente com o calendário do seu celular. Qualquer novo agendamento aparecerá em tempo real.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

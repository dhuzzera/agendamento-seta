import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface BookingLinkCardProps {
  slug?: string;
  isLoading?: boolean;
}

export function BookingLinkCard({ slug, isLoading }: BookingLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const bookingUrl = slug ? `${window.location.origin}/${slug}` : "";

  const handleCopy = () => {
    if (bookingUrl) {
      navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Seu Link de Agendamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando seu link...</p>
        ) : bookingUrl ? (
          <>
            <div className="bg-background rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Link único para compartilhar:</p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={bookingUrl}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className={copied ? "bg-green-50" : ""}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Compartilhe este link com seus clientes para que eles possam agendar reuniões com você.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Nenhum link disponível</p>
        )}
      </CardContent>
    </Card>
  );
}

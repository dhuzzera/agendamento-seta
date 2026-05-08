import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { AuthTabs } from "@/components/AuthTabs";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "representante") {
        navigate("/representante");
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold text-primary">Agendamento Seta</h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side - Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Agendamentos Simplificados
              </h2>
              <p className="text-lg text-muted-foreground">
                Sistema profissional de agendamento para representantes da Seta Embalagens. 
                Compartilhe links personalizados e gerencie reuniões com facilidade.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold">Links Personalizados</h3>
                  <p className="text-sm text-muted-foreground">Compartilhe seu link único com clientes</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold">Calendário Inteligente</h3>
                  <p className="text-sm text-muted-foreground">Disponibilidade em tempo real</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold">Sem Conflitos</h3>
                  <p className="text-sm text-muted-foreground">Bloqueio automático de horários ocupados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="flex justify-center">
            <AuthTabs
              onLoginSuccess={() => {
                // Redirecionamento é feito automaticamente pelo useEffect
              }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Seta Embalagens. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

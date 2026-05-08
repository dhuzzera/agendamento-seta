import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { CheckCircle2, Calendar, Users, BarChart3 } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirecionar usuários autenticados
  if (isAuthenticated && user) {
    if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "representante") {
      navigate("/representante");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-primary">Agendamento Seta</span>
          </div>
          <Button asChild variant="default" size="sm">
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Agendamentos Simplificados
              </h1>
              <p className="text-xl text-muted-foreground">
                Sistema profissional de agendamento para representantes da Seta Embalagens. Compartilhe links personalizados e gerencie reuniões com facilidade.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <a href={getLoginUrl()}>Começar Agora</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">Saiba Mais</a>
              </Button>
            </div>
          </div>

          {/* Illustration placeholder */}
          <div className="hidden md:block">
            <div className="relative h-96 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-24 w-24 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Sistema de Agendamento</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Recursos Principais
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar agendamentos de forma profissional e eficiente
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1 */}
          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Links Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cada representante possui um link único para compartilhar com clientes
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Gestão Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Administradores controlam representantes, disponibilidade e agendamentos
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Dashboard Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualize estatísticas e histórico de agendamentos em tempo real
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Confirmação Automática</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notificações por e-mail para representantes e administradores
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Como Funciona
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Representante Cria Link
              </h3>
              <p className="text-muted-foreground">
                Cada representante gera um link único para compartilhar com seus clientes
              </p>
            </div>
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/2 w-0.5 h-12 bg-gradient-to-b from-primary to-transparent transform translate-x-1/2" />
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Cliente Agenda
              </h3>
              <p className="text-muted-foreground">
                Cliente preenche dados, seleciona data e horário disponível
              </p>
            </div>
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/2 w-0.5 h-12 bg-gradient-to-b from-primary to-transparent transform translate-x-1/2" />
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Confirmação Automática
              </h3>
              <p className="text-muted-foreground">
                Representante recebe notificação e confirma o agendamento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            Pronto para Começar?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Acesse o sistema com suas credenciais e comece a gerenciar seus agendamentos
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <a href={getLoginUrl()}>Acessar Sistema</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 mt-20">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-3 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Agendamento Seta</h3>
              <p className="text-sm text-muted-foreground">
                Sistema profissional de agendamento para a Seta Embalagens
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Recursos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://setaembalagens.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Seta Embalagens</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Seta Embalagens. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

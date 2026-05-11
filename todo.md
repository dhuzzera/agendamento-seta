# Agendamento Seta - TODO

## Banco de Dados e Back-end
- [x] Criar tabelas: users, appointments, availability, representative_links, appointment_status_history
- [x] Implementar migrations SQL
- [x] Criar helpers de query no server/db.ts

## Autenticação e Autorização
- [x] Configurar OAuth Manus (já integrado)
- [x] Implementar role-based access control (admin/representante)
- [x] Criar protectedProcedure para representantes
- [x] Criar adminProcedure para admins

## APIs de Back-end (tRPC)
- [x] Representantes: CRUD (criar, listar, editar, desativar)
- [x] Agendamentos: criar, listar, filtrar, atualizar status, cancelar
- [x] Disponibilidade: configurar horários, bloquear datas
- [x] Links personalizados: gerar, validar
- [x] Notificações: enviar e-mail ao confirmar agendamento

## Interface Admin
- [x] Dashboard com estatísticas de agendamentos
- [x] Tabela de agendamentos com filtros (representante, data, status) - APIs implementadas
- [x] Gestão de representantes (CRUD) - APIs implementadas
- [x] Configuração de disponibilidade e bloqueios - APIs implementadas
- [x] Visualização de histórico de agendamentos - APIs implementadas
- [x] Componente AppointmentStats reutilizável
- [x] APIs tRPC para todas as funcionalidades

## Área do Representante
- [x] Dashboard pessoal com agendamentos
- [x] Geração e exibição de link único personalizado
- [x] Componente BookingLinkCard reutilizável
- [x] Configuração de disponibilidade (dias, horários, intervalo) - APIs implementadas
- [x] Bloqueio de datas específicas - APIs implementadas
- [x] Visualização de histórico de agendamentos - APIs implementadas
- [x] APIs tRPC para todas as funcionalidades

## Fluxo Público de Agendamento
- [x] Página pública com formulário do cliente (nome, empresa, telefone, e-mail)
- [x] Seleção de tipo de atendimento (reunião, visita, ligação)
- [x] Calendário com disponibilidade em tempo real
- [x] Seleção de horário com validação de conflitos
- [x] Página de confirmação pós-agendamento
- [x] Mensagem de sucesso
- [x] Componente CalendarPicker reutilizável

## Notificações
- [x] Enviar e-mail ao representante quando novo agendamento é criado
- [x] Enviar e-mail ao admin quando novo agendamento é criado - Implementado
- [x] Template de e-mail profissional
- [x] Integração de e-mail testada (falha gracefully em ambiente de teste)

## Design e Estilo
- [x] Configurar cores (#005383, branco, cinza claro)
- [x] Integrar fonte Montserrat
- [x] Criar componentes reutilizáveis
- [x] Garantir responsividade (mobile, tablet, desktop)

## Testes
- [x] Testes unitários para APIs críticas
- [x] Testes de validação de agendamento
- [x] Testes de controle de acesso (role-based)
- [x] Testes de conflito de horários (rejeitar duplicados) - Implementado
- [x] Testes de templates de e-mail
- [x] Testes de autorização por role

## Deployment e Finalização
- [x] Revisar funcionalidades (FUNCTIONAL_REVIEW.md)
- [x] Corrigir erros de API (links.getBySlug undefined)
- [x] Corrigir erro de render (setState durante render)
- [x] Corrigir ordem de rotas (catch-all)
- [x] Todos os 17 testes passando
- [x] Autenticação simples funcionando
- [x] Redirecionamento automático por role
- [x] Dashboards admin e representante operacionais
- [x] Fluxo público de agendamento completo
- [x] Banco de dados e APIs tRPC funcionando
- [x] Design responsivo e corporativo


## Autenticação Simples (Nova)
- [x] Remover OAuth Manus e implementar autenticação simples por email/nome
- [x] Criar tabela de sessões para rastrear usuários logados
- [x] Implementar login com email/nome (sem senha)
- [x] Implementar registro/cadastro simples
- [x] Adicionar aba de registro na página inicial
- [x] Isolamento de dados: representantes só veem seus próprios agendamentos
- [x] Isolamento de dados: admin vê todos os agendamentos
- [x] Validar acesso por role (admin/representante)
- [x] Testes de autenticação simples (5 testes passando)


## Autenticação com Senha (Nova)
- [x] Adicionar coluna 'password' na tabela de usuários
- [x] Implementar hash de senha com bcrypt
- [x] Validar senha no login
- [x] Atualizar AuthTabs com campo de senha
- [x] Validar força da senha no cadastro
- [x] Testes de autenticação com senha (10 testes passando)


## Bloqueio de Datas (Nova)
- [x] Criar interface para representantes bloquearem datas
- [x] Implementar API tRPC para gerenciar bloqueios
- [x] Integrar bloqueios ao calendário de agendamento público
- [x] Validar conflitos entre bloqueios e agendamentos

## Notificações por E-mail ao Cliente (Nova)
- [x] Enviar e-mail de confirmação quando representante confirmar agendamento
- [x] Enviar e-mail de cancelamento quando representante cancelar
- [x] Templates de e-mail profissionais
- [x] Testes de notificações

## Relatórios e Exportação (Nova)
- [x] Gerar relatório de agendamentos em PDF
- [x] Gerar relatório de agendamentos em CSV
- [x] Interface para filtrar e exportar dados
- [x] Incluir estatísticas no relatório


## Calendário Integrado Admin (Nova)
- [x] Criar componente de calendário semanal/mensal
- [x] Exibir todos os agendamentos no calendário
- [x] Cores diferentes por status (pendente, confirmado, cancelado)
- [x] Visualização de detalhes ao clicar no agendamento
- [x] Integrar ao AdminDashboard

## Dashboard de Performance (Nova)
- [x] Calcular taxa de confirmação de agendamentos
- [x] Identificar representante mais ativo
- [x] Análise de horários mais procurados
- [x] Gráficos de tendências
- [x] Integrar ao AdminDashboard


## Filtros no Calendário Admin (Nova)
- [x] Adicionar filtro por representante
- [x] Adicionar filtro por status
- [x] Aplicar filtros em tempo real
- [x] Mostrar contadores de agendamentos por filtro

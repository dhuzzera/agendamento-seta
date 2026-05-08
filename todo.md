# Agendamento Seta - TODO

## Banco de Dados e Back-end
- [x] Criar tabelas: users, appointments, availability, representative_links, appointment_status_history
- [x] Implementar migrations SQL
- [x] Criar helpers de query no server/db.ts

## Autenticação e Autorização
- [x] Configurar OAuth Manus (já integrado)
- [x] Implementar role-based access control (admin/representante)
- [x] Criar protectedProcedure para representantes
- [ ] Criar adminProcedure para admins

## APIs de Back-end (tRPC)
- [x] Representantes: CRUD (criar, listar, editar, desativar)
- [x] Agendamentos: criar, listar, filtrar, atualizar status, cancelar
- [x] Disponibilidade: configurar horários, bloquear datas
- [x] Links personalizados: gerar, validar
- [ ] Notificações: enviar e-mail ao confirmar agendamento

## Interface Admin
- [x] Dashboard com estatísticas de agendamentos
- [ ] Tabela de agendamentos com filtros (representante, data, status)
- [ ] Gestão de representantes (CRUD)
- [ ] Configuração de disponibilidade e bloqueios
- [ ] Visualização de histórico de agendamentos
- [x] Componente AppointmentStats reutilizável

## Área do Representante
- [x] Dashboard pessoal com agendamentos
- [x] Geração e exibição de link único personalizado
- [x] Componente BookingLinkCard reutilizável
- [ ] Configuração de disponibilidade (dias, horários, intervalo)
- [ ] Bloqueio de datas específicas
- [ ] Visualização de histórico de agendamentos

## Fluxo Público de Agendamento
- [x] Página pública com formulário do cliente (nome, empresa, telefone, e-mail)
- [x] Seleção de tipo de atendimento (reunião, visita, ligação)
- [x] Calendário com disponibilidade em tempo real
- [x] Seleção de horário com validação de conflitos
- [x] Página de confirmação pós-agendamento
- [x] Mensagem de sucesso
- [x] Componente CalendarPicker reutilizável

## Notificações
- [ ] Enviar e-mail ao representante quando novo agendamento é criado
- [ ] Enviar e-mail ao admin quando novo agendamento é criado
- [ ] Template de e-mail profissional

## Design e Estilo
- [x] Configurar cores (#005383, branco, cinza claro)
- [x] Integrar fonte Montserrat
- [x] Criar componentes reutilizáveis
- [x] Garantir responsividade (mobile, tablet, desktop)

## Testes
- [x] Testes unitários para APIs críticas
- [x] Testes de validação de agendamento
- [x] Testes de controle de acesso (role-based)
- [ ] Testes de conflito de horários

## Deployment e Finalização
- [ ] Revisar funcionalidades
- [ ] Testar fluxos completos
- [ ] Criar checkpoint final

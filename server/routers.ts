import { COOKIE_NAME } from "@shared/const";
import { adminProcedure } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as dbHelpers from "./db";
import { nanoid } from "nanoid";
import { sendEmail, getAppointmentEmailTemplate, getConfirmationEmailTemplate, getCancellationEmailTemplate } from "./_core/email";
import * as caldav from "./_core/caldav";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Representantes
  representatives: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "representante" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return dbHelpers.getRepresentativeByUserId(ctx.user.id);
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return dbHelpers.getAllRepresentatives();
    }),
    create: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          phone: z.string().optional(),
          city: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const rep = await dbHelpers.createRepresentative({
          userId: input.userId,
          phone: input.phone,
          city: input.city,
          isActive: true,
        });
        // Criar link personalizado automaticamente
        const slug = input.phone?.replace(/\D/g, "") || nanoid(8);
        // Link será criado após o representante ser criado
        return rep;
      }),
  }),

  // Links personalizados
  links: router({
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return dbHelpers.getRepresentativeLinkBySlug(input.slug);
      }),
    getMe: protectedProcedure.query(async ({ ctx }) => {
      const rep = await dbHelpers.getRepresentativeByUserId(ctx.user.id);
      if (!rep) throw new TRPCError({ code: "NOT_FOUND" });
      return dbHelpers.getRepresentativeLinkByRepId(rep.id);
    }),
  }),

  // Agendamentos
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "representante") {
        const rep = await dbHelpers.getRepresentativeByUserId(ctx.user.id);
        if (!rep) throw new TRPCError({ code: "NOT_FOUND" });
        return dbHelpers.getAppointmentsByRepresentativeId(rep.id);
      } else if (ctx.user.role === "admin") {
        return dbHelpers.getAllAppointments();
      }
      throw new TRPCError({ code: "FORBIDDEN" });
    }),
    create: publicProcedure
      .input(
        z.object({
          representativeId: z.number(),
          clientName: z.string(),
          clientCompany: z.string().optional(),
          clientPhone: z.string(),
          clientEmail: z.string().email(),
          clientCity: z.string().optional(),
          appointmentType: z.enum([
            "reuniao_online",
            "visita_presencial",
            "ligacao",
          ]),
          appointmentDate: z.string(),
          appointmentTime: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Verificar conflito de horário
        const existing = await dbHelpers.getAppointmentsByDate(
          input.representativeId,
          input.appointmentDate
        );
        const conflict = existing.find(
          (a) => a.appointmentTime === input.appointmentTime
        );
        if (conflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Horário já está ocupado",
          });
        }
        const appointment = await dbHelpers.createAppointment({
          representativeId: input.representativeId,
          clientName: input.clientName,
          clientCompany: input.clientCompany,
          clientPhone: input.clientPhone,
          clientEmail: input.clientEmail,
          clientCity: input.clientCity,
          appointmentType: input.appointmentType,
          appointmentDate: new Date(input.appointmentDate),
          appointmentTime: input.appointmentTime,
          notes: input.notes,
          status: "pendente",
        });

        // Enviar e-mails de notificacao
        try {
          const representative = await dbHelpers.getRepresentativeById(
            input.representativeId
          );
          const representativeUser = representative
            ? await dbHelpers.getUserById(representative.userId)
            : null;

          if (representativeUser?.email) {
            const representativeEmailHtml = getAppointmentEmailTemplate({
              clientName: input.clientName,
              clientCompany: input.clientCompany || "",
              clientPhone: input.clientPhone,
              clientEmail: input.clientEmail,
              clientCity: input.clientCity || "",
              appointmentType: input.appointmentType,
              appointmentDate: input.appointmentDate,
              appointmentTime: input.appointmentTime,
              notes: input.notes,
              representativeName: representativeUser.name || "Representante",
            });
            await sendEmail({
              to: representativeUser.email,
              subject: `Novo Agendamento: ${input.clientName}`,
              html: representativeEmailHtml,
            });
          }

          // Enviar e-mail de confirmacao ao cliente
          const clientEmailHtml = getConfirmationEmailTemplate({
            clientName: input.clientName,
            appointmentType: input.appointmentType,
            appointmentDate: input.appointmentDate,
            appointmentTime: input.appointmentTime,
            representativeName: representativeUser?.name || "Seta Embalagens",
          });
          await sendEmail({
            to: input.clientEmail,
            subject: "Agendamento Confirmado - Seta Embalagens",
            html: clientEmailHtml,
          });
        } catch (error) {
          console.error("[Appointments] Error sending notification emails:", error);
          // Nao falhar o agendamento se o e-mail falhar
        }

        return appointment;
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          appointmentId: z.number(),
          status: z.enum(["pendente", "confirmado", "cancelado", "concluido"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Verificar permissão
        if (
          ctx.user.role !== "admin" &&
          ctx.user.role !== "representante"
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // Se confirmando, enviar email de confirmacao ao cliente
        if (input.status === "confirmado") {
          try {
            const appointment = await dbHelpers.getAppointmentById(input.appointmentId);
            if (appointment) {
              const representative = await dbHelpers.getRepresentativeById(appointment.representativeId);
              const representativeUser = representative ? await dbHelpers.getUserById(representative.userId) : null;
              
              const appointmentDateStr = appointment.appointmentDate instanceof Date
                ? appointment.appointmentDate.toISOString().split('T')[0]
                : appointment.appointmentDate;
              
              const confirmationEmailHtml = getConfirmationEmailTemplate({
                clientName: appointment.clientName,
                appointmentType: appointment.appointmentType,
                appointmentDate: appointmentDateStr,
                appointmentTime: appointment.appointmentTime,
                representativeName: representativeUser?.name || "Seta Embalagens",
              });
              await sendEmail({
                to: appointment.clientEmail,
                subject: "Agendamento Confirmado - Seta Embalagens",
                html: confirmationEmailHtml,
              });
            }
          } catch (error) {
            console.error("[Appointments] Error sending confirmation email:", error);
          }
        }
        
        // Se cancelando, enviar email ao cliente
        if (input.status === "cancelado") {
          try {
            const appointment = await dbHelpers.getAppointmentById(input.appointmentId);
            if (appointment) {
              const representative = await dbHelpers.getRepresentativeById(appointment.representativeId);
              const representativeUser = representative ? await dbHelpers.getUserById(representative.userId) : null;
              
              const appointmentDateStr = appointment.appointmentDate instanceof Date
                ? appointment.appointmentDate.toISOString().split('T')[0]
                : appointment.appointmentDate;
              
              const cancellationEmailHtml = getCancellationEmailTemplate({
                clientName: appointment.clientName,
                appointmentType: appointment.appointmentType,
                appointmentDate: appointmentDateStr,
                appointmentTime: appointment.appointmentTime,
                representativeName: representativeUser?.name || "Seta Embalagens",
              });
              await sendEmail({
                to: appointment.clientEmail,
                subject: "Agendamento Cancelado - Seta Embalagens",
                html: cancellationEmailHtml,
              });
            }
          } catch (error) {
            console.error("[Appointments] Error sending cancellation email:", error);
          }
        }
        
        return dbHelpers.updateAppointmentStatus(
          input.appointmentId,
          input.status
        );
      }),
  }),

  // Gerenciamento de Usuários (Admin Only)
  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return dbHelpers.getAllUsers();
    }),
    updateRole: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(["admin", "representante"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        // Não permitir deletar o próprio admin
        if (input.userId === ctx.user.id && input.role !== "admin") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Você não pode remover suas próprias permissões de admin",
          });
        }
        return dbHelpers.updateUserRole(input.userId, input.role);
      }),
    delete: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        // Não permitir deletar a si mesmo
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Você não pode deletar sua própria conta",
          });
        }
        return dbHelpers.deleteUser(input.userId);
      }),
  }),

  // Disponibilidade
  availability: router({
    getByRepresentative: protectedProcedure
      .input(z.object({ representativeId: z.number() }))
      .query(async ({ input }) => {
        return dbHelpers.getAvailabilityByRepresentativeId(
          input.representativeId
        );
      }),
    create: protectedProcedure
      .input(
        z.object({
          representativeId: z.number(),
          dayOfWeek: z.number().min(0).max(6),
          startTime: z.string(),
          endTime: z.string(),
          intervalMinutes: z.number().default(60),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (
          ctx.user.role !== "admin" &&
          ctx.user.role !== "representante"
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return dbHelpers.createAvailability({
          representativeId: input.representativeId,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
          intervalMinutes: input.intervalMinutes,
        });
      }),
    getForDate: publicProcedure
      .input(z.object({ representativeId: z.number(), date: z.string() }))
      .query(async ({ input }) => {
        return dbHelpers.getAvailableTimesForDate(input.representativeId, input.date);
      }),
    isDayFull: publicProcedure
      .input(z.object({ representativeId: z.number(), date: z.string() }))
      .query(async ({ input }) => {
        return dbHelpers.isDayFullyBooked(input.representativeId, input.date);
      }),
  }),

  // Bloqueio de Datas
  dateBlockages: router({
    list: publicProcedure
      .input(z.object({ representativeId: z.number() }))
      .query(async ({ input }) => {
        return dbHelpers.getDateBlockagesByRepresentativeId(input.representativeId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          representativeId: z.number(),
          blockedDate: z.string(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "representante") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return dbHelpers.createDateBlockage({
          representativeId: input.representativeId,
          blockedDate: new Date(input.blockedDate),
          reason: input.reason,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ blockageId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "representante") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return dbHelpers.deleteDateBlockage(input.blockageId);
      }),
  }),

  // CalDAV
  caldav: router({
    getCredentials: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "representante" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const rep = await dbHelpers.getRepresentativeByUserId(ctx.user.id);
      if (!rep) throw new TRPCError({ code: "NOT_FOUND" });
      return caldav.getCalDAVCredentials(rep.id);
    }),
    generateFeed: publicProcedure
      .input(z.object({ representativeId: z.number(), token: z.string() }))
      .query(async ({ input }) => {
        const calendar = caldav.getCalDAVCalendarByToken(input.token);
        if (!calendar || calendar.representativeId !== input.representativeId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return caldav.generateCalendarFeed(input.representativeId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as dbHelpers from "./db";
import { nanoid } from "nanoid";
import { sendEmail, getAppointmentEmailTemplate, getConfirmationEmailTemplate } from "./_core/email";

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
        // Admin vê todos - implementar depois com query geral
        return [];
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
        return dbHelpers.updateAppointmentStatus(
          input.appointmentId,
          input.status
        );
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
  }),
});

export type AppRouter = typeof appRouter;

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, time, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name").notNull(),
  role: mysqlEnum("role", ["admin", "representante"]).default("representante").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sessoes de usuario para rastrear login
 */
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: int("userId").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Representantes (usuários com role 'representante')
 * Estende a tabela users com informações específicas
 */
export const representatives = mysqlTable("representatives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Representative = typeof representatives.$inferSelect;
export type InsertRepresentative = typeof representatives.$inferInsert;

/**
 * Links personalizados para agendamento
 * Cada representante possui um link único (slug)
 */
export const representativeLinks = mysqlTable("representative_links", {
  id: int("id").autoincrement().primaryKey(),
  representativeId: int("representativeId").notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RepresentativeLink = typeof representativeLinks.$inferSelect;
export type InsertRepresentativeLink = typeof representativeLinks.$inferInsert;

/**
 * Disponibilidade dos representantes
 * Define dias da semana, horários e intervalo entre reuniões
 */
export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  representativeId: int("representativeId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0 = domingo, 6 = sábado
  startTime: time("startTime").notNull(), // HH:MM:SS
  endTime: time("endTime").notNull(), // HH:MM:SS
  intervalMinutes: int("intervalMinutes").default(60).notNull(), // 30, 45 ou 60
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;

/**
 * Bloqueios de datas (feriados, férias, etc.)
 */
export const dateBlockages = mysqlTable("date_blockages", {
  id: int("id").autoincrement().primaryKey(),
  representativeId: int("representativeId").notNull(),
  blockedDate: date("blockedDate").notNull(),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DateBlockage = typeof dateBlockages.$inferSelect;
export type InsertDateBlockage = typeof dateBlockages.$inferInsert;

/**
 * Agendamentos de clientes
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  representativeId: int("representativeId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientCompany: varchar("clientCompany", { length: 255 }),
  clientPhone: varchar("clientPhone", { length: 20 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientCity: varchar("clientCity", { length: 100 }),
  appointmentType: mysqlEnum("appointmentType", ["reuniao_online", "visita_presencial", "ligacao"]).notNull(),
  appointmentDate: date("appointmentDate").notNull(),
  appointmentTime: time("appointmentTime").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["pendente", "confirmado", "cancelado", "concluido"]).default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
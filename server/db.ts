import { eq, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, representatives, appointments, availability, representativeLinks, dateBlockages, sessions } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Usuarios
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values(data);
  return result;
}

// Sessoes
export async function createSession(sessionId: string, userId: number, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(sessions).values({ id: sessionId, userId, expiresAt });
}

export async function getSession(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteSession(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(sessions).where(eq(sessions.id, sessionId));
}

// Representantes
export async function getRepresentativeByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(representatives).where(eq(representatives.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRepresentativeById(representativeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(representatives).where(eq(representatives.id, representativeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllRepresentatives() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(representatives).where(eq(representatives.isActive, true));
}

export async function createRepresentative(data: typeof representatives.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(representatives).values(data);
}

// Links personalizados
export async function getRepresentativeLinkBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(representativeLinks).where(eq(representativeLinks.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getRepresentativeLinkByRepId(representativeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(representativeLinks).where(eq(representativeLinks.representativeId, representativeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createRepresentativeLink(data: typeof representativeLinks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(representativeLinks).values(data);
}

// Agendamentos
export async function getAppointmentsByRepresentativeId(representativeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.representativeId, representativeId));
}

export async function getAppointmentsByDate(representativeId: number, dateStr: string) {
  const db = await getDb();
  if (!db) return [];
  const dateObj = new Date(dateStr);
  return db.select().from(appointments).where(
    and(
      eq(appointments.representativeId, representativeId),
      eq(appointments.appointmentDate, dateObj)
    )
  );
}

export async function createAppointment(data: typeof appointments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(appointments).values(data);
}

export async function updateAppointmentStatus(appointmentId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(appointments).set({ status: status as any }).where(eq(appointments.id, appointmentId));
}

// Disponibilidade
export async function getAvailabilityByRepresentativeId(representativeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(availability).where(eq(availability.representativeId, representativeId));
}

export async function createAvailability(data: typeof availability.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(availability).values(data);
}

// Bloqueios de data
export async function getDateBlockages(representativeId: number, dateStr: string) {
  const db = await getDb();
  if (!db) return [];
  const dateObj = new Date(dateStr);
  return db.select().from(dateBlockages).where(
    and(
      eq(dateBlockages.representativeId, representativeId),
      eq(dateBlockages.blockedDate, dateObj)
    )
  );
}

export async function createDateBlockage(data: typeof dateBlockages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(dateBlockages).values(data);
}

import { eq, and, or } from "drizzle-orm";
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
  
  // Insert representative
  const result = await db.insert(representatives).values(data);
  const representativeId = (result as any).insertId || (result as any)[0]?.id;
  
  // Create default working hours (Monday to Friday, 7am to 6pm)
  const defaultHours = [
    { dayOfWeek: 1, startTime: "07:00:00", endTime: "18:00:00" }, // Monday
    { dayOfWeek: 2, startTime: "07:00:00", endTime: "18:00:00" }, // Tuesday
    { dayOfWeek: 3, startTime: "07:00:00", endTime: "18:00:00" }, // Wednesday
    { dayOfWeek: 4, startTime: "07:00:00", endTime: "18:00:00" }, // Thursday
    { dayOfWeek: 5, startTime: "07:00:00", endTime: "18:00:00" }, // Friday
  ];
  
  if (representativeId) {
    for (const hours of defaultHours) {
      await db.insert(availability).values({
        representativeId: representativeId as number,
        dayOfWeek: hours.dayOfWeek,
        startTime: hours.startTime as any,
        endTime: hours.endTime as any,
        intervalMinutes: 60,
      });
    }
  }
  
  return result;
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

export async function getDateBlockagesByRepresentativeId(representativeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dateBlockages).where(eq(dateBlockages.representativeId, representativeId));
}

export async function deleteDateBlockage(blockageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(dateBlockages).where(eq(dateBlockages.id, blockageId));
}

// Obter agendamento por ID
export async function getAppointmentById(appointmentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appointments).where(eq(appointments.id, appointmentId));
  return result[0] || null;
}

// Obter todos os agendamentos (para admin)
export async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).orderBy(appointments.appointmentDate);
}

// Obter representante com nome do usuário
export async function getRepresentativeWithUser(representativeId: number) {
  const db = await getDb();
  if (!db) return null;
  const rep = await db.select().from(representatives).where(eq(representatives.id, representativeId));
  if (!rep[0]) return null;
  const user = await db.select().from(users).where(eq(users.id, rep[0].userId));
  return {
    ...rep[0],
    userName: user[0]?.name || "Desconhecido",
  };
}


// Gerenciamento de Usuários
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

export async function updateUserRole(userId: number, role: "admin" | "representante") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Deletar sessões do usuário
  await db.delete(sessions).where(eq(sessions.userId, userId));
  
  // Deletar representante associado (se houver)
  const rep = await getRepresentativeByUserId(userId);
  if (rep) {
    // Deletar links personalizados
    await db.delete(representativeLinks).where(eq(representativeLinks.representativeId, rep.id));
    // Deletar disponibilidades
    await db.delete(availability).where(eq(availability.representativeId, rep.id));
    // Deletar bloqueios de data
    await db.delete(dateBlockages).where(eq(dateBlockages.representativeId, rep.id));
    // Deletar agendamentos
    await db.delete(appointments).where(eq(appointments.representativeId, rep.id));
    // Deletar representante
    await db.delete(representatives).where(eq(representatives.userId, userId));
  }
  
  // Deletar usuário
  return db.delete(users).where(eq(users.id, userId));
}


// Calcular horários disponíveis para uma data específica (considerando duração de 1h)
export async function getAvailableTimesForDate(representativeId: number, date: string) {
  const db = await getDb();
  if (!db) return [];

  // Obter dia da semana (0 = domingo, 1 = segunda, ..., 6 = sábado)
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Obter horários de disponibilidade para este dia
  const availabilityForDay = await db
    .select()
    .from(availability)
    .where(and(eq(availability.representativeId, representativeId), eq(availability.dayOfWeek, dayOfWeek)));

  if (availabilityForDay.length === 0) {
    return []; // Dia não disponível
  }

  const dayAvailability = availabilityForDay[0];
  
  // Obter agendamentos confirmados/pendentes para este dia
  const existingAppointments = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.representativeId, representativeId),
        eq(appointments.appointmentDate, date as any),
        or(
          eq(appointments.status, "pendente"),
          eq(appointments.status, "confirmado")
        )
      )
    );

  // Gerar slots de 1 hora a partir do horário de início
  const slots: string[] = [];
  const startTime = dayAvailability.startTime;
  const endTime = dayAvailability.endTime;

  // Converter times para minutos
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Gerar slots de 1 hora
  for (let currentMinutes = startMinutes; currentMinutes + 60 <= endMinutes; currentMinutes += 60) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const slotTime = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;

    // Verificar se este slot está disponível (sem conflito com agendamentos existentes)
    const isAvailable = !existingAppointments.some((apt) => {
      const [aptHour, aptMin] = apt.appointmentTime.split(":").map(Number);
      const aptStartMinutes = aptHour * 60 + aptMin;
      const aptEndMinutes = aptStartMinutes + (apt.durationMinutes || 60);

      // Conflito se o novo slot (1h) sobrepõe com agendamento existente
      return currentMinutes < aptEndMinutes && currentMinutes + 60 > aptStartMinutes;
    });

    if (isAvailable) {
      slots.push(slotTime);
    }
  }

  return slots;
}

// Verificar se um dia está totalmente cheio
export async function isDayFullyBooked(representativeId: number, date: string) {
  const availableTimes = await getAvailableTimesForDate(representativeId, date);
  return availableTimes.length === 0;
}

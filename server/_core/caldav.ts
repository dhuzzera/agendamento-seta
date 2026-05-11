import { v4 as uuidv4 } from "uuid";
import * as dbHelpers from "../db";

/**
 * CalDAV Server Implementation
 * Provides CalDAV protocol support for calendar synchronization
 */

export interface CalDAVCalendar {
  id: string;
  representativeId: number;
  name: string;
  description: string;
  color: string;
  token: string;
  createdAt: Date;
}

// In-memory store for CalDAV calendars (in production, use database)
const calendars = new Map<string, CalDAVCalendar>();

/**
 * Generate CalDAV token for a representative
 */
export function generateCalDAVToken(representativeId: number): string {
  const token = `caldav_${representativeId}_${uuidv4()}`;
  return token;
}

/**
 * Create CalDAV calendar for representative
 */
export function createCalDAVCalendar(
  representativeId: number,
  name: string = "Agendamentos"
): CalDAVCalendar {
  const calendar: CalDAVCalendar = {
    id: uuidv4(),
    representativeId,
    name,
    description: `Calendário de agendamentos de ${name}`,
    color: "#0066cc",
    token: generateCalDAVToken(representativeId),
    createdAt: new Date(),
  };

  calendars.set(calendar.id, calendar);
  return calendar;
}

/**
 * Get CalDAV calendar by token
 */
export function getCalDAVCalendarByToken(token: string): CalDAVCalendar | null {
  const calendarsArray = Array.from(calendars.values());
  for (const calendar of calendarsArray) {
    if (calendar.token === token) {
      return calendar;
    }
  }
  return null;
}

/**
 * Format date for iCalendar (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Convert appointment to iCalendar VEVENT format
 */
export function appointmentToICalEvent(appointment: any): string {
  // Parse date and time
  const [year, month, day] = appointment.appointmentDate
    .split("-")
    .map(Number);
  const [hours, minutes] = appointment.appointmentTime.split(":").map(Number);

  // Create start date
  const startDate = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, 0)
  );

  // Create end date (add duration)
  const endDate = new Date(
    startDate.getTime() + (appointment.durationMinutes || 60) * 60 * 1000
  );

  const dtstart = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}00`;
  const endHours = endDate.getUTCHours();
  const endMinutes = endDate.getUTCMinutes();
  const endDay = endDate.getUTCDate();
  const endMonth = endDate.getUTCMonth() + 1;
  const endYear = endDate.getUTCFullYear();
  const dtend = `${endYear}${String(endMonth).padStart(2, "0")}${String(endDay).padStart(2, "0")}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

  const uid = `appointment_${appointment.id}@agendamento-seta.local`;
  const dtstamp = formatICalDate(new Date());

  const statusColor =
    appointment.status === "confirmado"
      ? "GREEN"
      : appointment.status === "pendente"
        ? "YELLOW"
        : "RED";

  return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:Agendamento - ${appointment.clientName}
DESCRIPTION:Cliente: ${appointment.clientName}\\nEmail: ${appointment.clientEmail}\\nTelefone: ${appointment.clientPhone}\\nTipo: ${appointment.appointmentType}\\nStatus: ${appointment.status}\\nNotas: ${(appointment.notes || "N/A").replace(/\n/g, "\\n")}
LOCATION:
ORGANIZER;CN=Seta Embalagens:mailto:agendamentos@seta.com
STATUS:${appointment.status === "confirmado" ? "CONFIRMED" : "TENTATIVE"}
TRANSP:OPAQUE
X-MICROSOFT-CDO-BUSYSTATUS:BUSY
X-MICROSOFT-CDO-INTENDEDSTATUS:BUSY
X-MICROSOFT-CDO-ALLDAYEVENT:FALSE
END:VEVENT`;
}

/**
 * Generate iCalendar feed for representative
 */
export async function generateCalendarFeed(
  representativeId: number
): Promise<string> {
  const appointments = await dbHelpers.getAppointmentsByRepresentativeId(
    representativeId
  );

  const now = new Date();
  const dtstamp = formatICalDate(now);

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Seta Embalagens//Agendamento Seta//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Agendamentos Seta
X-WR-TIMEZONE:America/Sao_Paulo
X-WR-CALDESC:Calendário de agendamentos
BEGIN:VTIMEZONE
TZID:America/Sao_Paulo
BEGIN:STANDARD
DTSTART:20000219T000000
TZOFFSETFROM:-0300
TZOFFSETTO:-0300
TZNAME:BRST
END:STANDARD
END:VTIMEZONE
`;

  // Add events
  for (const appointment of appointments) {
    if (appointment.status === "cancelado") continue; // Skip cancelled appointments
    icsContent += appointmentToICalEvent(appointment) + "\n";
  }

  icsContent += "END:VCALENDAR";

  return icsContent;
}

/**
 * Generate CalDAV URL for representative
 */
export function generateCalDAVUrl(
  representativeId: number,
  token: string,
  baseUrl: string
): string {
  return `${baseUrl}/api/caldav/calendar/${representativeId}/${token}`;
}

/**
 * Get CalDAV credentials for representative
 */
export function getCalDAVCredentials(representativeId: number): {
  url: string;
  username: string;
  password: string;
} {
  const calendar = createCalDAVCalendar(representativeId);
  const baseUrl = process.env.VITE_APP_URL || "https://agendamento-seta.local";

  return {
    url: generateCalDAVUrl(representativeId, calendar.token, baseUrl),
    username: `rep_${representativeId}`,
    password: calendar.token,
  };
}

import { nanoid } from "nanoid";
import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_EXPIRY_HOURS = 24;

export async function createSessionForUser(userId: number, res: Response) {
  const sessionId = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  
  await db.createSession(sessionId, userId, expiresAt);
  
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
    path: "/",
  });
  
  return sessionId;
}

export async function getUserFromSession(req: Request): Promise<User | null> {
  const sessionId = req.cookies[SESSION_COOKIE_NAME];
  
  if (!sessionId) {
    return null;
  }
  
  const session = await db.getSession(sessionId);
  
  if (!session || new Date() > session.expiresAt) {
    return null;
  }
  
  const user = await db.getUserById(session.userId);
  return user || null;
}

export async function clearSession(sessionId: string, res: Response) {
  await db.deleteSession(sessionId);
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
}

export async function loginOrRegisterUser(email: string, name: string, role: "admin" | "representante" = "representante") {
  let user = await db.getUserByEmail(email);
  
  if (!user) {
    // Criar novo usuário
    const result = await db.createUser({
      email,
      name,
      role,
    });
    
    // Buscar o usuário criado
    user = await db.getUserByEmail(email);
    
    if (!user) {
      throw new Error("Failed to create user");
    }
  }
  
  return user;
}

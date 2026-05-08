import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_EXPIRY_HOURS = 24;
const BCRYPT_ROUNDS = 10;

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

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Senha deve ter no mínimo 8 caracteres");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra maiúscula");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Senha deve conter pelo menos um número");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string,
  name: string,
  password: string,
  role: "admin" | "representante" = "representante"
) {
  // Check if user already exists
  const existingUser = await db.getUserByEmail(email);
  if (existingUser) {
    throw new Error("Email já está registrado");
  }
  
  // Validate password strength
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    throw new Error(validation.errors.join("; "));
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create user
  const result = await db.createUser({
    email,
    name,
    password: hashedPassword,
    role,
  });
  
  // Fetch and return the created user
  const user = await db.getUserByEmail(email);
  if (!user) {
    throw new Error("Failed to create user");
  }
  
  return user;
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string): Promise<User> {
  const user = await db.getUserByEmail(email);
  
  if (!user) {
    throw new Error("Email ou senha incorretos");
  }
  
  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Email ou senha incorretos");
  }
  
  return user;
}

/**
 * Legacy: Login or register user (for backwards compatibility)
 * This now requires a password
 */
export async function loginOrRegisterUser(
  email: string,
  name: string,
  password: string,
  role: "admin" | "representante" = "representante"
) {
  let user = await db.getUserByEmail(email);
  
  if (!user) {
    // Create new user
    user = await registerUser(email, name, password, role);
  } else {
    // Verify password for existing user
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email ou senha incorretos");
    }
  }
  
  return user;
}

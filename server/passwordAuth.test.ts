import { describe, it, expect, beforeAll } from "vitest";
import * as auth from "./_core/simpleAuth";
import * as db from "./db";

describe("Password Authentication", () => {
  beforeAll(async () => {
    // Ensure database is connected
    const database = await db.getDb();
    if (!database) {
      throw new Error("Database not available for tests");
    }
  });

  it("should hash password correctly", async () => {
    const password = "TestPassword123";
    const hash = await auth.hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);
  });

  it("should verify correct password", async () => {
    const password = "TestPassword123";
    const hash = await auth.hashPassword(password);

    const isValid = await auth.verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const password = "TestPassword123";
    const hash = await auth.hashPassword(password);

    const isValid = await auth.verifyPassword("WrongPassword456", hash);
    expect(isValid).toBe(false);
  });

  it("should validate password strength", () => {
    // Weak password
    const weak = auth.validatePasswordStrength("weak");
    expect(weak.valid).toBe(false);
    expect(weak.errors.length).toBeGreaterThan(0);

    // Strong password
    const strong = auth.validatePasswordStrength("StrongPass123");
    expect(strong.valid).toBe(true);
    expect(strong.errors.length).toBe(0);
  });

  it("should register user with password", async () => {
    const email = `register-${Date.now()}@example.com`;
    const name = "Test User";
    const password = "TestPassword123";

    const user = await auth.registerUser(email, name, password, "representante");

    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.name).toBe(name);
    expect(user.password).not.toBe(password); // Should be hashed
  });

  it("should reject duplicate email registration", async () => {
    const email = `duplicate-${Date.now()}@example.com`;
    const name = "Test User";
    const password = "TestPassword123";

    // First registration
    await auth.registerUser(email, name, password, "representante");

    // Second registration with same email
    try {
      await auth.registerUser(email, "Another Name", "AnotherPass456", "representante");
      expect.fail("Should have thrown error for duplicate email");
    } catch (error) {
      expect(error instanceof Error && error.message.includes("Email já está registrado")).toBe(true);
    }
  });

  it("should reject weak password on registration", async () => {
    const email = `weak-${Date.now()}@example.com`;
    const name = "Test User";
    const weakPassword = "weak";

    try {
      await auth.registerUser(email, name, weakPassword, "representante");
      expect.fail("Should have thrown error for weak password");
    } catch (error) {
      expect(error instanceof Error && error.message.includes("Senha")).toBe(true);
    }
  });

  it("should login user with correct password", async () => {
    const email = `login-${Date.now()}@example.com`;
    const name = "Test User";
    const password = "TestPassword123";

    // Register user
    await auth.registerUser(email, name, password, "representante");

    // Login with correct password
    const user = await auth.loginUser(email, password);
    expect(user.email).toBe(email);
    expect(user.name).toBe(name);
  });

  it("should reject login with incorrect password", async () => {
    const email = `login-fail-${Date.now()}@example.com`;
    const name = "Test User";
    const password = "TestPassword123";

    // Register user
    await auth.registerUser(email, name, password, "representante");

    // Try to login with wrong password
    try {
      await auth.loginUser(email, "WrongPassword456");
      expect.fail("Should have thrown error for incorrect password");
    } catch (error) {
      expect(error instanceof Error && error.message.includes("Email ou senha")).toBe(true);
    }
  });

  it("should reject login with non-existent email", async () => {
    try {
      await auth.loginUser("nonexistent@example.com", "SomePassword123");
      expect.fail("Should have thrown error for non-existent user");
    } catch (error) {
      expect(error instanceof Error && error.message.includes("Email ou senha")).toBe(true);
    }
  });
});

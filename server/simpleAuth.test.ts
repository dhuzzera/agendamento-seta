import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import { loginOrRegisterUser } from "./_core/simpleAuth";

describe("Simple Authentication", () => {
  beforeAll(async () => {
    // Ensure database is connected
    const database = await db.getDb();
    if (!database) {
      throw new Error("Database not available for tests");
    }
  });

  it("should create a new user on first login", async () => {
    const email = `test-${Date.now()}@example.com`;
    const name = "Test User";
    const password = "TestPassword123";

    const user = await loginOrRegisterUser(email, name, password, "representante");

    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.name).toBe(name);
    expect(user.role).toBe("representante");
  });

  it("should return existing user on subsequent login", async () => {
    const email = `test-existing-${Date.now()}@example.com`;
    const name = "Existing User";
    const password = "TestPassword123";

    // First login
    const user1 = await loginOrRegisterUser(email, name, password, "representante");

    // Second login with same credentials
    const user2 = await loginOrRegisterUser(email, name, password, "representante");

    expect(user1.id).toBe(user2.id);
    expect(user2.email).toBe(email);
  });

  it("should create admin users", async () => {
    const email = `admin-${Date.now()}@example.com`;
    const name = "Admin User";
    const password = "AdminPassword123";

    const user = await loginOrRegisterUser(email, name, password, "admin");

    expect(user.role).toBe("admin");
  });

  it("should retrieve user by email", async () => {
    const email = `retrieve-${Date.now()}@example.com`;
    const name = "Retrieve Test";
    const password = "TestPassword123";

    const createdUser = await loginOrRegisterUser(email, name, password, "representante");
    const retrievedUser = await db.getUserByEmail(email);

    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.id).toBe(createdUser.id);
    expect(retrievedUser?.email).toBe(email);
  });

  it("should retrieve user by id", async () => {
    const email = `byid-${Date.now()}@example.com`;
    const name = "By ID Test";
    const password = "TestPassword123";

    const createdUser = await loginOrRegisterUser(email, name, password, "representante");
    const retrievedUser = await db.getUserById(createdUser.id);

    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.id).toBe(createdUser.id);
  });
});

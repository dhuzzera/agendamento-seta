import type { Express, Request, Response } from "express";
import { createSessionForUser, loginOrRegisterUser, clearSession, getUserFromSession } from "./simpleAuth";

export function registerSimpleAuthRoutes(app: Express) {
  // Login/Registro
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, name, role } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }
      
      const user = await loginOrRegisterUser(email, name, role || "representante");
      await createSessionForUser(user.id, res);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies.session_id;
      if (sessionId) {
        await clearSession(sessionId, res);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await getUserFromSession(req);
      if (!user) {
        return res.json({ user: null });
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Get me error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });
}

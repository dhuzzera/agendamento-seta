import type { Express, Request, Response } from "express";
import { createSessionForUser, loginUser, registerUser, clearSession, getUserFromSession } from "./simpleAuth";

export function registerSimpleAuthRoutes(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, name, password, role } = req.body;
      
      if (!email || !name || !password) {
        return res.status(400).json({ error: "Email, nome e senha são obrigatórios" });
      }
      
      const user = await registerUser(email, name, password, role || "representante");
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
      console.error("[Auth] Register error:", error);
      const message = error instanceof Error ? error.message : "Registro falhou";
      res.status(400).json({ error: message });
    }
  });
  
  // Login with email and password
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }
      
      const user = await loginUser(email, password);
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
      const message = error instanceof Error ? error.message : "Login falhou";
      res.status(401).json({ error: message });
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
      res.status(500).json({ error: "Logout falhou" });
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
      res.status(500).json({ error: "Falha ao obter usuário" });
    }
  });
}

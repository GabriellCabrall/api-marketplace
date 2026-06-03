import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token não fornecido" });
    return;
  }

  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { tipo: string };

    if (payload.tipo !== "admin") {
      res.status(403).json({ message: "Acesso negado" });
      return;
    }

    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}

export { JWT_SECRET };

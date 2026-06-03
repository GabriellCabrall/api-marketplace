import { eq } from "drizzle-orm";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { JWT_SECRET } from "../middleware/auth";

const router = Router();

router.post("/", async (req, res) => {
  const { nome, email, senha, tipo, regiao } = req.body;

  if (tipo === "admin") {
    const { adminSecret } = req.body;
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      res.status(403).json({ message: "Não autorizado" });
      return;
    }
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    res.status(409).json({ message: "E-mail já cadastrado" });
    return;
  }

  const hash = await bcrypt.hash(senha, 10);
  await db.insert(users).values({ nome, email, senha: hash, tipo, regiao });

  res.status(201).json({ message: "Usuário cadastrado com sucesso" });
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) {
    res.status(401).json({ message: "E-mail ou senha incorretos" });
    return;
  }

  const user = result[0];
  const valid = await bcrypt.compare(senha, user.senha);
  if (!valid) {
    res.status(401).json({ message: "E-mail ou senha incorretos" });
    return;
  }

  const { senha: _, ...userWithoutPassword } = user;
  const token = jwt.sign(
    { id: user.id, email: user.email, tipo: user.tipo },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
  res.json({ user: userWithoutPassword, token });
});

export default router;

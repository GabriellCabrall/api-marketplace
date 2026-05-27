import { eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db";
import { contracts } from "../db/schema";

const router = Router();

router.get("/", async (req, res) => {
  const { userEmail, prestadorEmail } = req.query;

  if (userEmail && typeof userEmail === "string") {
    const result = await db.select().from(contracts).where(eq(contracts.userEmail, userEmail));
    res.json(result);
    return;
  }

  if (prestadorEmail && typeof prestadorEmail === "string") {
    const result = await db.select().from(contracts).where(eq(contracts.prestadorEmail, prestadorEmail));
    res.json(result);
    return;
  }

  res.status(400).json({ message: "userEmail ou prestadorEmail é obrigatório" });
});

router.post("/", async (req, res) => {
  const { serviceId, titulo, preco, userEmail, prestadorEmail, metodoPagamento, data, hora } = req.body;

  if (!serviceId || !titulo || !preco || !userEmail || !prestadorEmail || !metodoPagamento) {
    res.status(400).json({ message: "Todos os campos são obrigatórios" });
    return;
  }

  const criadoEm = new Date().toISOString();

  const result = await db
    .insert(contracts)
    .values({ serviceId, titulo, preco, userEmail, prestadorEmail, metodoPagamento, data, hora, criadoEm })
    .returning();

  res.status(201).json(result[0]);
});

export default router;

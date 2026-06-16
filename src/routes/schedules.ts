import { eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db";
import { schedules } from "../db/schema";

const router = Router();

router.get("/", async (req, res) => {
  const { userEmail, prestadorEmail } = req.query;

  if (userEmail && typeof userEmail === "string") {
    const result = await db.select().from(schedules).where(eq(schedules.userEmail, userEmail));
    res.json(result);
    return;
  }

  if (prestadorEmail && typeof prestadorEmail === "string") {
    const result = await db.select().from(schedules).where(eq(schedules.prestadorEmail, prestadorEmail));
    res.json(result);
    return;
  }

  res.status(400).json({ message: "userEmail ou prestadorEmail é obrigatório" });
});

router.post("/", async (req, res) => {
  const { serviceId, titulo, userEmail, prestadorEmail, data, hora } = req.body;

  if (!serviceId || !titulo || !userEmail || !prestadorEmail || !data || !hora) {
    res.status(400).json({ message: "Todos os campos são obrigatórios" });
    return;
  }

  const criadoEm = new Date().toISOString();

  const result = await db
    .insert(schedules)
    .values({ serviceId, titulo, userEmail, prestadorEmail, data, hora, criadoEm })
    .returning();

  res.status(201).json(result[0]);
});

router.patch("/:id/confirmar", async (req, res) => {
  const id = Number(req.params.id);

  const result = await db
    .update(schedules)
    .set({ status: "confirmado" })
    .where(eq(schedules.id, id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Agendamento não encontrado" });
    return;
  }

  res.json(result[0]);
});

router.patch("/:id/cancelar", async (req, res) => {
  const id = Number(req.params.id);

  const result = await db
    .update(schedules)
    .set({ status: "cancelado" })
    .where(eq(schedules.id, id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Agendamento não encontrado" });
    return;
  }

  res.json(result[0]);
});

export default router;

import { eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db";
import { schedules } from "../db/schema";

const router = Router();

router.get("/", async (req, res) => {
  const { userEmail } = req.query;

  if (!userEmail || typeof userEmail !== "string") {
    res.status(400).json({ message: "userEmail é obrigatório" });
    return;
  }

  const result = await db
    .select()
    .from(schedules)
    .where(eq(schedules.userEmail, userEmail));

  res.json(result);
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

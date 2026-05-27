import { asc, eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db";
import { messages } from "../db/schema";

const router = Router();

router.get("/", async (req, res) => {
  const { contractId } = req.query;

  if (!contractId || typeof contractId !== "string") {
    res.status(400).json({ message: "contractId é obrigatório" });
    return;
  }

  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.contractId, Number(contractId)))
    .orderBy(asc(messages.id));

  res.json(result);
});

router.post("/", async (req, res) => {
  const { contractId, senderEmail, text } = req.body;

  if (!contractId || !senderEmail || !text) {
    res.status(400).json({ message: "Todos os campos são obrigatórios" });
    return;
  }

  const criadoEm = new Date().toISOString();

  const result = await db
    .insert(messages)
    .values({ contractId: Number(contractId), senderEmail, text, criadoEm })
    .returning();

  res.status(201).json(result[0]);
});

export default router;

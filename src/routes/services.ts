import { eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db";
import { services } from "../db/schema";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await db.select().from(services);
  res.json(result);
});

router.post("/", async (req, res) => {
  const { titulo, descricao, categoria, preco, telefone, regiao, prestadorEmail } = req.body;

  const result = await db
    .insert(services)
    .values({ titulo, descricao, categoria, preco, telefone, regiao, prestadorEmail })
    .returning();

  res.status(201).json(result[0]);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { titulo, descricao, categoria, preco, telefone, regiao } = req.body;

  const result = await db
    .update(services)
    .set({ titulo, descricao, categoria, preco, telefone, regiao })
    .where(eq(services.id, id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Serviço não encontrado" });
    return;
  }

  res.json(result[0]);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const result = await db
    .delete(services)
    .where(eq(services.id, id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Serviço não encontrado" });
    return;
  }

  res.status(204).send();
});

export default router;

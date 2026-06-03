import { eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db";
import { users, services, contracts, schedules } from "../db/schema";

const router = Router();

// GET /admin/stats — totais para o dashboard
router.get("/stats", async (_req, res) => {
  const [allUsers, allServices, allContracts] = await Promise.all([
    db.select().from(users),
    db.select().from(services),
    db.select().from(contracts),
  ]);

  res.json({
    usuarios: allUsers.filter((u) => u.tipo === "usuario").length,
    prestadores: allUsers.filter((u) => u.tipo === "prestador").length,
    servicos: allServices.length,
    contratos: {
      total: allContracts.length,
      pendente: allContracts.filter((c) => c.status === "pendente").length,
      confirmado: allContracts.filter((c) => c.status === "confirmado").length,
      cancelado: allContracts.filter((c) => c.status === "cancelado").length,
    },
  });
});

// GET /admin/users — todos os usuários (sem senha)
router.get("/users", async (_req, res) => {
  const result = await db.select().from(users);
  const sem_senha = result.map(({ senha: _, ...u }) => u);
  res.json(sem_senha);
});

// DELETE /admin/users/:id — remove usuário
router.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  const result = await db.delete(users).where(eq(users.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Usuário não encontrado" });
    return;
  }

  res.status(204).send();
});

// GET /admin/services — todos os serviços
router.get("/services", async (_req, res) => {
  const result = await db.select().from(services);
  res.json(result);
});

// DELETE /admin/services/:id — remove serviço
router.delete("/services/:id", async (req, res) => {
  const id = Number(req.params.id);

  const result = await db.delete(services).where(eq(services.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Serviço não encontrado" });
    return;
  }

  res.status(204).send();
});

// GET /admin/contracts — todos os contratos
router.get("/contracts", async (_req, res) => {
  const result = await db.select().from(contracts);
  res.json(result);
});

// DELETE /admin/contracts/:id — remove contrato
router.delete("/contracts/:id", async (req, res) => {
  const id = Number(req.params.id);

  const result = await db.delete(contracts).where(eq(contracts.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Contrato não encontrado" });
    return;
  }

  res.status(204).send();
});

// PATCH /admin/contracts/:id/status — alterar status manualmente
router.patch("/contracts/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: "pendente" | "confirmado" | "cancelado" };

  if (!["pendente", "confirmado", "cancelado"].includes(status)) {
    res.status(400).json({ message: "Status inválido" });
    return;
  }

  const result = await db
    .update(contracts)
    .set({ status })
    .where(eq(contracts.id, id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Contrato não encontrado" });
    return;
  }

  res.json(result[0]);
});

export default router;

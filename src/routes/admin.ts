import { eq } from "drizzle-orm";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, services, contracts, schedules } from "../db/schema";

const router = Router();

// ── Stats ──────────────────────────────────────────────────────────────────

router.get("/stats", async (_req, res) => {
  const [allUsers, allServices, allContracts] = await Promise.all([
    db.select().from(users),
    db.select().from(services),
    db.select().from(contracts),
  ]);

  res.json({
    usuarios: allUsers.filter((u) => u.tipo === "usuario").length,
    prestadores: allUsers.filter((u) => u.tipo === "prestador").length,
    admins: allUsers.filter((u) => u.tipo === "admin").length,
    servicos: allServices.length,
    contratos: {
      total: allContracts.length,
      pendente:   allContracts.filter((c) => c.status === "pendente").length,
      confirmado: allContracts.filter((c) => c.status === "confirmado").length,
      rejeitado:  allContracts.filter((c) => c.status === "rejeitado").length,
      cancelado:  allContracts.filter((c) => c.status === "cancelado").length,
    },
  });
});

// ── Users ──────────────────────────────────────────────────────────────────

router.get("/users", async (_req, res) => {
  const result = await db.select().from(users);
  res.json(result.map(({ senha: _, ...u }) => u));
});

router.post("/users", async (req, res) => {
  const { nome, email, senha, tipo, regiao } = req.body;

  if (!nome || !email || !senha || !tipo || !regiao) {
    res.status(400).json({ message: "Todos os campos são obrigatórios" });
    return;
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    res.status(409).json({ message: "E-mail já cadastrado" });
    return;
  }

  const hash = await bcrypt.hash(senha, 10);
  const result = await db
    .insert(users)
    .values({ nome, email, senha: hash, tipo, regiao })
    .returning();

  const { senha: _, ...created } = result[0];
  res.status(201).json(created);
});

router.patch("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nome, tipo, regiao } = req.body;

  const updates: Partial<{ nome: string; tipo: "usuario" | "prestador" | "admin"; regiao: string }> = {};
  if (nome)   updates.nome   = nome;
  if (tipo)   updates.tipo   = tipo;
  if (regiao) updates.regiao = regiao;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ message: "Nenhum campo para atualizar" });
    return;
  }

  const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Usuário não encontrado" });
    return;
  }

  const { senha: _, ...updated } = result[0];
  res.json(updated);
});

router.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await db.delete(users).where(eq(users.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Usuário não encontrado" });
    return;
  }

  res.status(204).send();
});

// ── Services ───────────────────────────────────────────────────────────────

router.get("/services", async (_req, res) => {
  res.json(await db.select().from(services));
});

router.post("/services", async (req, res) => {
  const { titulo, descricao, categoria, preco, telefone, regiao, prestadorEmail } = req.body;

  if (!titulo || !descricao || !categoria || !preco || !telefone || !regiao || !prestadorEmail) {
    res.status(400).json({ message: "Todos os campos são obrigatórios" });
    return;
  }

  const result = await db
    .insert(services)
    .values({ titulo, descricao, categoria, preco, telefone, regiao, prestadorEmail })
    .returning();

  res.status(201).json(result[0]);
});

router.patch("/services/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { titulo, descricao, categoria, preco, telefone, regiao, prestadorEmail } = req.body;

  const updates: Partial<typeof services.$inferInsert> = {};
  if (titulo)         updates.titulo         = titulo;
  if (descricao)      updates.descricao      = descricao;
  if (categoria)      updates.categoria      = categoria;
  if (preco)          updates.preco          = preco;
  if (telefone)       updates.telefone       = telefone;
  if (regiao)         updates.regiao         = regiao;
  if (prestadorEmail) updates.prestadorEmail = prestadorEmail;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ message: "Nenhum campo para atualizar" });
    return;
  }

  const result = await db.update(services).set(updates).where(eq(services.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Serviço não encontrado" });
    return;
  }

  res.json(result[0]);
});

router.delete("/services/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await db.delete(services).where(eq(services.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Serviço não encontrado" });
    return;
  }

  res.status(204).send();
});

// ── Contracts ──────────────────────────────────────────────────────────────

router.get("/contracts", async (_req, res) => {
  res.json(await db.select().from(contracts));
});

router.patch("/contracts/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: string };

  const valid = ["pendente", "confirmado", "rejeitado", "cancelado"];
  if (!valid.includes(status)) {
    res.status(400).json({ message: "Status inválido" });
    return;
  }

  const result = await db
    .update(contracts)
    .set({ status: status as "pendente" | "confirmado" | "rejeitado" | "cancelado" })
    .where(eq(contracts.id, id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Contrato não encontrado" });
    return;
  }

  res.json(result[0]);
});

router.delete("/contracts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await db.delete(contracts).where(eq(contracts.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Contrato não encontrado" });
    return;
  }

  res.status(204).send();
});

// ── Schedules ──────────────────────────────────────────────────────────────

router.get("/schedules", async (_req, res) => {
  res.json(await db.select().from(schedules));
});

router.patch("/schedules/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: string };

  const valid = ["pendente", "confirmado", "cancelado"];
  if (!valid.includes(status)) {
    res.status(400).json({ message: "Status inválido" });
    return;
  }

  const result = await db
    .update(schedules)
    .set({ status: status as "pendente" | "confirmado" | "cancelado" })
    .where(eq(schedules.id, id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Agendamento não encontrado" });
    return;
  }

  res.json(result[0]);
});

router.delete("/schedules/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await db.delete(schedules).where(eq(schedules.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ message: "Agendamento não encontrado" });
    return;
  }

  res.status(204).send();
});

export default router;

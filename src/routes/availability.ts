import { and, eq, inArray } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db";
import { providerAvailability, schedules, contracts } from "../db/schema";

const router = Router();

// GET /availability?prestadorEmail=X  →  todos os slots cadastrados pelo prestador
router.get("/", async (req, res) => {
  const { prestadorEmail } = req.query;

  if (!prestadorEmail || typeof prestadorEmail !== "string") {
    res.status(400).json({ message: "prestadorEmail é obrigatório" });
    return;
  }

  const result = await db
    .select()
    .from(providerAvailability)
    .where(eq(providerAvailability.prestadorEmail, prestadorEmail));

  res.json(result);
});

// POST /availability  →  substitui a disponibilidade do prestador
// body: { prestadorEmail, slots: [{ diaSemana, hora }] }
router.post("/", async (req, res) => {
  const { prestadorEmail, slots } = req.body as {
    prestadorEmail: string;
    slots: { diaSemana: number; hora: string }[];
  };

  if (!prestadorEmail || !Array.isArray(slots)) {
    res.status(400).json({ message: "prestadorEmail e slots são obrigatórios" });
    return;
  }

  // Remove os slots antigos e insere os novos em uma única transação
  await db.delete(providerAvailability).where(
    eq(providerAvailability.prestadorEmail, prestadorEmail)
  );

  if (slots.length > 0) {
    await db.insert(providerAvailability).values(
      slots.map((s) => ({ prestadorEmail, diaSemana: s.diaSemana, hora: s.hora }))
    );
  }

  res.status(200).json({ ok: true });
});

// GET /availability/slots?prestadorEmail=X&data=YYYY-MM-DD
// Retorna apenas os horários disponíveis do prestador para uma data específica,
// descontando os slots já reservados (schedules + contracts).
router.get("/slots", async (req, res) => {
  const { prestadorEmail, data } = req.query;

  if (
    !prestadorEmail || typeof prestadorEmail !== "string" ||
    !data || typeof data !== "string"
  ) {
    res.status(400).json({ message: "prestadorEmail e data são obrigatórios" });
    return;
  }

  // Dia da semana da data solicitada (0=Dom … 6=Sáb)
  const [ano, mes, dia] = data.split("-").map(Number);
  const diaSemana = new Date(ano, mes - 1, dia).getDay();

  // Slots que o prestador configurou para esse dia da semana
  const disponivel = await db
    .select({ hora: providerAvailability.hora })
    .from(providerAvailability)
    .where(
      and(
        eq(providerAvailability.prestadorEmail, prestadorEmail),
        eq(providerAvailability.diaSemana, diaSemana)
      )
    );

  if (disponivel.length === 0) {
    res.json([]);
    return;
  }

  // Horários já reservados via schedules nessa data (apenas ativos)
  const agendados = await db
    .select({ hora: schedules.hora })
    .from(schedules)
    .where(
      and(
        eq(schedules.prestadorEmail, prestadorEmail),
        eq(schedules.data, data),
        inArray(schedules.status, ["pendente", "confirmado"])
      )
    );

  // Horários já reservados via contracts nessa data (apenas ativos)
  const contratados = await db
    .select({ hora: contracts.hora })
    .from(contracts)
    .where(
      and(
        eq(contracts.prestadorEmail, prestadorEmail),
        eq(contracts.data, data),
        inArray(contracts.status, ["pendente", "confirmado"])
      )
    );

  const ocupados = new Set([
    ...agendados.map((r) => r.hora),
    ...contratados.map((r) => r.hora),
  ]);

  const livres = disponivel
    .map((r) => r.hora)
    .filter((h) => !ocupados.has(h))
    .sort();

  res.json(livres);
});

export default router;

import express from "express";
import { db } from "../db";
import { contracts, saques } from "../db/schema";
import { and, eq } from "drizzle-orm";

const router = express.Router();

function isAvailable(data: string | null, hora: string | null): boolean {
  if (!data) return true;
  const scheduled = hora
    ? new Date(`${data}T${hora}:00`)
    : new Date(`${data}T23:59:59`);
  return new Date() > scheduled;
}

async function getWalletContracts(prestadorEmail: string) {
  const confirmed = await db
    .select()
    .from(contracts)
    .where(
      and(
        eq(contracts.prestadorEmail, prestadorEmail),
        eq(contracts.status, "confirmado")
      )
    );

  const allSaques = await db
    .select()
    .from(saques)
    .where(eq(saques.prestadorEmail, prestadorEmail));

  const withdrawnIds = new Set<number>(
    allSaques.flatMap((s) => JSON.parse(s.contractIds) as number[])
  );

  return confirmed
    .filter((c) => !withdrawnIds.has(c.id))
    .map((c) => ({
      id: c.id,
      titulo: c.titulo,
      data: c.data ?? null,
      hora: c.hora ?? null,
      preco: c.preco,
      disponivel: isAvailable(c.data ?? null, c.hora ?? null),
    }));
}

router.get("/", async (req, res) => {
  const { prestadorEmail } = req.query;
  if (!prestadorEmail || typeof prestadorEmail !== "string") {
    return res.status(400).json({ error: "prestadorEmail é obrigatório" });
  }

  try {
    const walletContracts = await getWalletContracts(prestadorEmail);

    const total = walletContracts.reduce(
      (sum, c) => sum + parseFloat(c.preco),
      0
    );
    const disponivel = walletContracts
      .filter((c) => c.disponivel)
      .reduce((sum, c) => sum + parseFloat(c.preco), 0);

    res.json({ total, disponivel, contratos: walletContracts });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Erro interno" });
  }
});

router.post("/saque", async (req, res) => {
  const { prestadorEmail, chavePix } = req.body;
  if (!prestadorEmail || !chavePix) {
    return res
      .status(400)
      .json({ error: "prestadorEmail e chavePix são obrigatórios" });
  }

  try {
    const walletContracts = await getWalletContracts(prestadorEmail);
    const available = walletContracts.filter((c) => c.disponivel);

    if (available.length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhum valor disponível para saque" });
    }

    const valor = available.reduce((sum, c) => sum + parseFloat(c.preco), 0);
    const contractIds = JSON.stringify(available.map((c) => c.id));

    const [saque] = await db
      .insert(saques)
      .values({
        prestadorEmail,
        valor: valor.toFixed(2),
        chavePix,
        contractIds,
        criadoEm: new Date().toISOString(),
      })
      .returning();

    res.json({ saque, valor });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Erro interno" });
  }
});

export default router;

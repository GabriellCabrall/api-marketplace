import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  tipo: text("tipo", { enum: ["usuario", "prestador", "admin"] }).notNull().default("usuario"),
  regiao: text("regiao").notNull(),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titulo: text("titulo").notNull(),
  descricao: text("descricao").notNull(),
  categoria: text("categoria").notNull(),
  preco: text("preco").notNull(),
  telefone: text("telefone").notNull(),
  regiao: text("regiao").notNull(),
  prestadorEmail: text("prestadorEmail").notNull(),
});

export const contracts = sqliteTable("contracts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("serviceId").notNull(),
  titulo: text("titulo").notNull(),
  preco: text("preco").notNull(),
  userEmail: text("userEmail").notNull(),
  prestadorEmail: text("prestadorEmail").notNull(),
  metodoPagamento: text("metodoPagamento", { enum: ["pix", "cartao"] }).notNull(),
  data: text("data"),
  hora: text("hora"),
  status: text("status", { enum: ["pendente", "confirmado", "cancelado"] }).notNull().default("pendente"),
  criadoEm: text("criadoEm").notNull(),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contractId: integer("contractId").notNull(),
  senderEmail: text("senderEmail").notNull(),
  text: text("text").notNull(),
  criadoEm: text("criadoEm").notNull(),
});

export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("serviceId").notNull(),
  titulo: text("titulo").notNull(),
  userEmail: text("userEmail").notNull(),
  prestadorEmail: text("prestadorEmail").notNull(),
  data: text("data").notNull(),
  hora: text("hora").notNull(),
  status: text("status", { enum: ["pendente", "confirmado", "cancelado"] }).notNull().default("pendente"),
  criadoEm: text("criadoEm").notNull(),
});

// Disponibilidade recorrente por dia da semana (0=Dom … 6=Sáb)
export const providerAvailability = sqliteTable("providerAvailability", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prestadorEmail: text("prestadorEmail").notNull(),
  diaSemana: integer("diaSemana").notNull(), // 0-6
  hora: text("hora").notNull(),             // "08:00" … "18:00"
});

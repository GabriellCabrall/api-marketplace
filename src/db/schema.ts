import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  tipo: text("tipo", { enum: ["usuario", "prestador"] }).notNull().default("usuario"),
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

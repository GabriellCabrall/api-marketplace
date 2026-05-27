# api-marketplace

API REST para o marketplace de serviços. Gerencia cadastro e autenticação de usuários e o CRUD de serviços oferecidos por prestadores.

## Tecnologias

- **Node.js** + **TypeScript**
- **Express** — servidor HTTP
- **Drizzle ORM** — acesso ao banco de dados
- **Turso** (libSQL/SQLite) — banco de dados
- **bcryptjs** — hash de senhas
- **Vercel** — deploy

## Pré-requisitos

- Node.js 18+
- Conta no [Turso](https://turso.tech) com um banco criado

## Instalação

```bash
npm install
```

Crie um arquivo `.env` na raiz com base no `.env.example`:

```env
DATABASE_URL=libsql://<seu-banco>.turso.io
DATABASE_AUTH_TOKEN=<seu-token>
```

## Scripts

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build
npm run build

# Rodar build
npm start

# Gerar e aplicar migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Endpoints

### Usuários

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/users` | Cadastrar usuário |
| `POST` | `/users/login` | Autenticar usuário |

**POST /users — body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "tipo": "usuario",
  "regiao": "Sudeste"
}
```
`tipo` aceita `"usuario"` ou `"prestador"`.

**POST /users/login — body:**
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

---

### Serviços

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/services` | Listar todos os serviços |
| `POST` | `/services` | Cadastrar serviço |
| `PUT` | `/services/:id` | Editar serviço |
| `DELETE` | `/services/:id` | Remover serviço |

**POST /services — body:**
```json
{
  "titulo": "Pintura residencial",
  "descricao": "Pintura interna e externa com materiais inclusos.",
  "categoria": "Reforma",
  "preco": "150.00",
  "telefone": "11999999999",
  "regiao": "Sudeste",
  "prestadorEmail": "prestador@email.com"
}
```

---

### Health check

```
GET /health → { "status": "ok" }
```

## Estrutura

```
src/
├── db/
│   ├── index.ts      # conexão com o banco
│   └── schema.ts     # tabelas users e services
├── routes/
│   ├── users.ts
│   └── services.ts
└── index.ts          # entrada da aplicação
```

## Deploy (Vercel)

A API está publicada em:

```
https://api-marketplace-eta.vercel.app
```

Para fazer seu próprio deploy, conecte o repositório ao Vercel e configure as variáveis de ambiente `DATABASE_URL` e `DATABASE_AUTH_TOKEN` no painel do projeto.

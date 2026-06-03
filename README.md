# api-marketplace

API REST para o marketplace de serviços. Gerencia usuários, serviços, contratos, agendamentos, disponibilidade de prestadores e mensagens de chat.

## Início rápido

A API já está em produção e é usada pelo app por padrão:

```
https://api-marketplace-eta.vercel.app
```

Só é necessário rodar localmente se quiser modificar a API.

---

## Pré-requisitos

- Node.js 18+
- Conta no [Turso](https://turso.tech) com um banco criado

---

## Instalação

```bash
npm install
```

Crie um arquivo `.env` na raiz com base no `.env.example`:

```env
DATABASE_URL=libsql://<seu-banco>.turso.io
DATABASE_AUTH_TOKEN=<seu-token>
```

Aplique o schema no banco:

```bash
npm run db:push
```

Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
```

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia com hot reload (tsx watch) |
| `npm start` | Inicia sem hot reload |
| `npm run db:push` | Aplica o schema Drizzle no banco (Turso) |
| `npm run db:studio` | Abre o Drizzle Studio para inspecionar dados |

---

## Endpoints

### Saúde

```
GET /health → { "status": "ok" }
```

---

### Usuários `/users`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/users` | Cadastrar usuário |
| `POST` | `/users/login` | Autenticar usuário |

**POST /users**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "tipo": "usuario",
  "regiao": "Sudeste"
}
```
`tipo`: `"usuario"` ou `"prestador"`

**POST /users/login**
```json
{ "email": "joao@email.com", "senha": "123456" }
```

---

### Serviços `/services`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/services` | Listar todos os serviços |
| `POST` | `/services` | Cadastrar serviço |
| `PUT` | `/services/:id` | Editar serviço |
| `DELETE` | `/services/:id` | Remover serviço |

**POST /services**
```json
{
  "titulo": "Pintura residencial",
  "descricao": "Pintura interna e externa com materiais inclusos.",
  "categoria": "Pintura",
  "preco": "150.00",
  "telefone": "11999999999",
  "regiao": "Sudeste",
  "prestadorEmail": "prestador@email.com"
}
```

---

### Contratos `/contracts`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/contracts?userEmail=X` | Contratos do usuário |
| `GET` | `/contracts?prestadorEmail=X` | Contratos recebidos pelo prestador |
| `POST` | `/contracts` | Criar contrato (status inicial: `pendente`) |
| `PATCH` | `/contracts/:id/confirmar` | Prestador confirma o contrato |
| `PATCH` | `/contracts/:id/cancelar` | Cancelar contrato |

**POST /contracts**
```json
{
  "serviceId": 1,
  "titulo": "Pintura residencial",
  "preco": "150.00",
  "userEmail": "cliente@email.com",
  "prestadorEmail": "prestador@email.com",
  "metodoPagamento": "pix",
  "data": "2025-07-10",
  "hora": "09:00"
}
```
`metodoPagamento`: `"pix"` ou `"cartao"`

---

### Agendamentos `/schedules`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/schedules?userEmail=X` | Agendamentos do usuário |
| `POST` | `/schedules` | Criar agendamento |
| `PATCH` | `/schedules/:id/cancelar` | Cancelar agendamento |

**POST /schedules**
```json
{
  "serviceId": 1,
  "titulo": "Pintura residencial",
  "userEmail": "cliente@email.com",
  "prestadorEmail": "prestador@email.com",
  "data": "2025-07-10",
  "hora": "09:00"
}
```

---

### Disponibilidade `/availability`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/availability?prestadorEmail=X` | Slots cadastrados pelo prestador |
| `POST` | `/availability` | Salvar disponibilidade (substitui tudo) |
| `GET` | `/availability/slots?prestadorEmail=X&data=YYYY-MM-DD` | Horários livres para uma data (desconta reservados) |

**POST /availability**
```json
{
  "prestadorEmail": "prestador@email.com",
  "slots": [
    { "diaSemana": 1, "hora": "08:00" },
    { "diaSemana": 1, "hora": "09:00" },
    { "diaSemana": 3, "hora": "14:00" }
  ]
}
```
`diaSemana`: `0` = Domingo … `6` = Sábado

---

### Mensagens `/messages`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/messages?contractId=X` | Mensagens do contrato |
| `POST` | `/messages` | Enviar mensagem |

**POST /messages**
```json
{
  "contractId": 1,
  "senderEmail": "cliente@email.com",
  "text": "Olá, pode vir na sexta?"
}
```

---

## Estrutura

```
src/
├── db/
│   ├── index.ts          # conexão com o Turso
│   └── schema.ts         # todas as tabelas
└── routes/
│   ├── users.ts
│   ├── services.ts
│   ├── contracts.ts
│   ├── schedules.ts
│   ├── availability.ts
│   └── messages.ts
└── index.ts              # entrada da aplicação + registro de rotas
```

---

## Deploy (Vercel)

A API está publicada em `https://api-marketplace-eta.vercel.app`.

Para fazer seu próprio deploy, conecte o repositório ao Vercel e configure as variáveis de ambiente `DATABASE_URL` e `DATABASE_AUTH_TOKEN` no painel do projeto.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 18+ |
| Linguagem | TypeScript |
| Framework | Express |
| ORM | Drizzle ORM |
| Banco de dados | Turso (libSQL / SQLite) |
| Hash de senhas | bcryptjs |
| Deploy | Vercel |

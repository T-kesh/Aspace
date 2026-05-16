# Aspace Backend

Recommended stack for this project:

- **Language:** TypeScript on Node.js
- **Framework:** Express
- **Database:** PostgreSQL

Why this fits Aspace: the README already specifies a React/Vite frontend, a TypeScript SDK, ethers/viem-style blockchain integration, and a REST API. A TypeScript Express API keeps frontend, SDK, and backend models aligned. PostgreSQL is a strong fit for off-chain metadata such as agents, task state, reputation history, treasury activity, and dashboard filtering. Redis can be added later for event indexing, queues, and cache once the on-chain listener grows.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

From the repo root, after PostgreSQL is running:

```bash
npm run db:migrate
npm run dev
```

This starts the backend, the marketing frontend, and the dapp together.

If you have Docker Desktop installed, you can start PostgreSQL from the repo root:

```bash
docker compose up -d postgres
npm run db:migrate
npm run dev
```

The API runs on:

```text
http://localhost:3001/api/v1
```

The marketing frontend runs on:

```text
http://localhost:3000
```

The dapp runs on:

```text
http://localhost:5173
```

Sample frontend call:

```ts
const response = await fetch("http://localhost:3001/api/v1/agents");
const data = await response.json();
```

Useful endpoints:

- `GET /api/v1/health`
- `GET /api/v1/agents`
- `POST /api/v1/agents`
- `GET /api/v1/agents/:address`
- `GET /api/v1/registry/query?capability=web-scraper&minReputation=50&maxPrice=25`

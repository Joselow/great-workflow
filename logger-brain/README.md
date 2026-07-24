# logger-brain

Backend de **Flow Work Logger**. API REST con Express + TypeScript, PostgreSQL vía Drizzle ORM.

Ver [AGENTS.md](./AGENTS.md) para la arquitectura y convenciones del proyecto.

## Requisitos

- Node.js
- pnpm
- PostgreSQL

## Setup

```bash
pnpm install
cp .env.example .env   # completar con tus credenciales locales
pnpm db:push            # sincroniza el esquema con la base de datos
pnpm dev
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con recarga en caliente |
| `pnpm build` | Genera el bundle de producción en `dist/` |
| `pnpm start` | Corre el bundle ya construido |
| `pnpm typecheck` | Chequeo de tipos sin emitir archivos |
| `pnpm db:generate` | Genera migraciones a partir de los schemas |
| `pnpm db:migrate` | Aplica migraciones pendientes |
| `pnpm db:push` | Sincroniza el esquema directo (uso en desarrollo) |
| `pnpm db:studio` | Abre Drizzle Studio |

## Estado

En desarrollo activo. Módulo de autenticación (registro/login con JWT) implementado.

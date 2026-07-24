# AGENTS.md — logger-brain (Backend)

Backend de **Flow Work Logger**. API REST construida con Express + TypeScript, persistencia en PostgreSQL vía Drizzle ORM.

## Stack

- Node.js + TypeScript (ESM puro, `"type": "module"`)
- Express 4
- Drizzle ORM (`drizzle-orm/node-postgres`) + PostgreSQL (`pg`)
- Zod para validación de entrada
- JWT (`jsonwebtoken`) + `bcryptjs` para autenticación
- `tsx` (dev con watch), `esbuild` (build de producción)

## Arquitectura (flujo de una request)

```
routes/ → middlewares (rate limit, validación) → controllers/ → services/ → db/schemas/
```

- **routes/**: define endpoints y encadena middlewares + controller. No contiene lógica propia.
- **middlewares/requestForm/**: valida `req.body` contra los schemas de `validations/` y lanza `BadRequestError400` si falla.
- **middlewares/security/**: rate limiters por endpoint (`createAccountLimiter`, `loginLimiter`, `globalLimiter`), creados con la factory `createLimiter`.
- **middlewares/handlers/**: `errorHandler` (handler global de errores) y `notFound` (catch-all 404).
- **controllers/**: orquestan la petición — leen `req.body`, llaman a `services/`, arman la respuesta con `utils/responses`. Sin acceso directo a la base de datos.
- **services/**: única capa que toca la base de datos (Drizzle). Sin lógica de HTTP (no reciben `req`/`res`).
- **db/schemas/**: definición de tablas Drizzle, una tabla por archivo. `commons.ts` centraliza columnas compartidas (timestamps).
- **validations/**: schemas Zod puros, sin dependencias de Express.
- **errors/**: clases de error, todas extienden `BaseError` (`message`, `statusCode`, `errors`).
- **utils/**: helpers sin estado (`jwt`, `password`, `responses`, `catchErrors`, `formatValidationError`).

## Manejo de errores

- Nunca uses try/catch manual en controllers: envuelve el handler con `catchErrors(fn)` (para rutas) o `catchMiddlewareErrors(fn)` (para middlewares async).
- Lanza (`throw`) errores tipados de `errors/`; no respondas con `res.status(...).json(...)` directo salvo dentro de `utils/responses.ts`.
- Todo error termina en `middlewares/handlers/errorHandler.ts`, que responde `{ success: false, message, errors?, stack?, cause? }` (`stack`/`cause` solo en `development`/`test`).
- Si necesitas un error nuevo, crea una clase en `errors/` que extienda `BaseError` con su `statusCode` por defecto en el nombre (`BadRequestError400`, `InvalidCredentialsError401`, etc.) — no reutilices un error existente para un caso semánticamente distinto.

## Respuestas

- Éxito: `success(res, statusCode, data)` de `utils/responses.ts` → siempre `{ success: true, ...data }`.
- No construyas el JSON de respuesta a mano dentro de un controller.

## Validación

- Un schema Zod por entidad/acción, en `validations/`.
- El middleware correspondiente en `middlewares/requestForm/` valida y usa `formatValidationErrors` (Zod `flattenError`) antes de lanzar `BadRequestError400`.
- Los controllers asumen que `req.body` ya fue validado por el middleware — no revalides ahí.

## Autenticación

- Password: `utils/password.ts` (`bcryptjs`, `SALT_ROUNDS = 12`). Nunca compares ni guardes passwords en texto plano.
- JWT: `utils/jwt.ts` (`generateAccessToken` / `verifyAccessToken`), payload tipado en `interfaces/jwt.d.ts`.
- El middleware `requireAuth` (`middlewares/auth.ts`) acepta el token por header `Authorization: Bearer <token>` o por cookie `token`.
- Nunca devuelvas el campo `password` en una respuesta — destructura antes de responder (`const { password: _, ...rest } = user`).

## Base de datos

- Fuente de verdad del esquema: `src/db/schemas/*.ts` (así lo apunta `drizzle.config.ts`). `src/db/schema.ts` (archivo suelto en la raíz de `db/`) es legado — no agregues tablas ahí, usa `db/schemas/`.
- Cada tabla en su propio archivo dentro de `db/schemas/`. Columnas comunes (timestamps) en `commons.ts`.
- Migraciones: `pnpm db:generate` (genera SQL), `pnpm db:migrate` (aplica), `pnpm db:push` (sync directo en dev), `pnpm db:studio` (UI).
- El acceso a datos vive solo en `services/`, usando el cliente `db` exportado desde `db/index.ts`.

## Variables de entorno

- Todo acceso a `process.env` pasa por `config/env.ts`. Usa `required("VAR")` para variables obligatorias — lanza `InternalServerError500` si falta.
- No leas `process.env` directamente fuera de `config/env.ts`.
- Variables esperadas: ver `.env.example`.

## Convenciones

- Un archivo, una responsabilidad (una clase de error, un servicio, un router por recurso).
- Nombres de archivo en camelCase; clases de error con su código HTTP en el nombre.
- Sin comentarios explicando el "qué"; si comentas, que sea el "por qué" (ver `catchErrors.ts` como referencia de estilo del proyecto).

## Comandos

- `pnpm dev` — servidor con recarga en caliente (`tsx watch`)
- `pnpm build` — bundle de producción con esbuild a `dist/`
- `pnpm start` — corre el build
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm db:generate` / `db:migrate` / `db:push` / `db:studio` — Drizzle Kit

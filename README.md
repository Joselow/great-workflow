# Flow Work Logger

Gestor de flujo de trabajo de ciclo cerrado (closed-loop): centraliza reuniones, ideas, requerimientos, tareas y seguimiento en una única plataforma.

Ver [CLAUDE.md](./CLAUDE.md) para el detalle de la visión y los objetivos del producto.

## Proyectos

Monorepo con dos proyectos independientes:

- [`logger-brain/`](./logger-brain) — Backend. API REST con Express + TypeScript + Drizzle ORM + PostgreSQL.
- [`mission-log/`](./mission-log) — Frontend. Vue 3 + TypeScript + Vite + Tailwind CSS.

Cada uno tiene su propio `README.md`, `AGENTS.md`/`CLAUDE.md` y ciclo de vida (`package.json`) independiente.

## Estado

En desarrollo activo. El backend ya tiene una arquitectura definida (auth, base de datos); el frontend está en etapa inicial.

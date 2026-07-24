# AGENTS.md

**Flow Work Logger** — gestor de flujo de trabajo de ciclo cerrado (closed-loop) para centralizar reuniones, ideas, requerimientos, tareas y seguimiento. Ver `CLAUDE.md` para el detalle de la visión y los objetivos del producto.

## Estructura del repositorio

Monorepo con dos proyectos independientes (sin workspace/tooling compartido), cada uno con su propio stack, convenciones y `AGENTS.md`/`CLAUDE.md`:

- `logger-brain/` — Backend. API REST con Express + TypeScript + Drizzle ORM + PostgreSQL. Arquitectura ya definida, ver `logger-brain/AGENTS.md`.
- `mission-log/` — Frontend. Vue 3 + TypeScript + Vite + Tailwind CSS. Todavía en etapa temprana, la arquitectura de carpetas va a cambiar pronto, ver `mission-log/AGENTS.md`.

Al trabajar dentro de `logger-brain/` o `mission-log/`, seguir las convenciones definidas en el `AGENTS.md`/`CLAUDE.md` de esa carpeta, no las de este archivo raíz.

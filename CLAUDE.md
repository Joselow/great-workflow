Flow Work Logger APP

## Porque de la app

Es una aplicación que me ayudará a gestionar gran parte de mi trabajo actual.
Es parte de mi meta grande actual **“Manejar mi actual trabajo con sistemas y procesos buenos”**

Con el objetivo de: **“Obtener mayor tiempo libre,  realizarme y avanzar hacia mi proposito de y en vida:”**

Tiene ingerencia en parte de los tres puntos, de la meta.

1. Registrar y responder situaciones.
2. Solucionar y comunicar.
3. Gestion de reuniones.

Llevados de la mano con procesos, definidos para  el uso en cada uno.

---

## Aplicación

**La aplicación es un Gestor de Flujo de Trabajo - Ciclo cerrado (closed-loop)** 

Centraliza reuniones, ideas, requerimientos, tareas y seguimiento en una única plataforma. Convierte cada reunión en conocimiento accionable, mantiene la trazabilidad entre decisiones y facilita la generación de reportes, resúmenes e historial del proyecto

### **Abarca 5 puntos principales**

1. Registro de propuestas, ideas, etc (LOGS)
2. Planificación de reuniones.
3. Registro de requerimientos y tareas.
4. Accesso a informacion en forma de cards.
5. Reportes, rapidos, y estructurados.

---

## Estructura del repositorio

Monorepo con dos proyectos independientes (sin workspace/tooling compartido), cada uno con su propio stack, convenciones y `AGENTS.md`/`CLAUDE.md`:

- `logger-brain/` — Backend. API REST con Express + TypeScript + Drizzle ORM + PostgreSQL. Arquitectura ya definida, ver `logger-brain/AGENTS.md`.
- `mission-log/` — Frontend. Vue 3 + TypeScript + Vite + Tailwind CSS. Todavía en etapa temprana, la arquitectura de carpetas va a cambiar pronto, ver `mission-log/CLAUDE.md`.

Al trabajar dentro de `logger-brain/` o `mission-log/`, seguir las convenciones definidas en el `AGENTS.md`/`CLAUDE.md` de esa carpeta, no las de este archivo raíz.
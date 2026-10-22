# AGENTS.md — mission-log (Frontend)

Frontend de **Flow Work Logger**. Vue 3 + TypeScript + Vite + Tailwind CSS.

La arquitectura de carpetas todavía está en definición. `CLAUDE.md` describe la estructura objetivo, pero el código actual en `src/` es un scaffold inicial (componentes sueltos, sin router ni store consolidados) y va a reorganizarse pronto.

Arquitectura por capas.
- Organizas por tipo de archivo o responsabilidad.

No asumas que lo descrito en `CLAUDE.md` ya está implementado — revisa `src/` antes de decidir dónde ubicar un archivo nuevo. Evita sobre-invertir en abstracciones de carpetas hasta que la arquitectura se estabilice.

**UI**
Estilo Pastel Soft UI / Soft Brutalism
Mantén una interfaz limpia, plana, sin sombras pesadas
Usa tarjetas con bordes suaves redondeados pequeños y delineado fino

**Responsive UI**
- Desktop es el layout principal.
- Adaptar la interfaz a móviles con enfoque mobile-first.
Info:
- El writer global se muestra como panel lateral derecho en escritorio y como pestaña inferior en móviles.
- Cerrado, el writer no debe alterar el ancho del contenido ni superponerse a la interfaz.


*Watch*
Usa watch con criterio, moderación y escalabilidad. Úsalo cuando varios datos cambien y una misma función deba reaccionar, como en filtros. 
Evítalo como mecanismo general de reacción; prioriza soluciones simples y claras.


# CLAUDE.md

## Stack

- Vue 3
- TypeScript
- Vite
- Tailwind CSS

## Principios

- Priorizar simplicidad sobre complejidad.
- Código legible antes que código "ingenioso".
- Evitar duplicación (DRY).
- Una responsabilidad por archivo.
- Reutilizar antes de crear.

## Arquitectura

```
src/
├── assets/
├── components/        # Componentes reutilizables
│
├── layouts/           # Layouts (Auth, Dashboard, etc.)
│
├── views/             # Vistas del router
│   ├── auth/
│   ├── dashboard/
│   ├── users/
│   └── settings/
│
├── router/
│
├── stores/            # Pinia (estado global)
│
├── services/          # Axios y llamadas HTTP
│
├── composables/       # Lógica reutilizable
│
├── helpers/           # Funciones auxiliares, puede incluir logica de negocio, reutilizable
│
├── utils/         # Utilidades sin logica de negocio reutilizable
│
├── constants/         # Constantes
│
├── interfaces/        # Interfaces y tipos
│
├── plugins/
│
├── App.vue
└── main.ts
```

## Reglas

- Componentes únicamente para UI.
- Servicios para llamadas HTTP.
- Composables para lógica reutilizable.
- Helpers para funciones puras.
- Interfaces para contratos.
- Constants para valores compartidos.
- Stores únicamente para estado global.

## Convenciones

- Componentes → `PascalCase.vue`
- Composables → `useUsers.ts`
- Servicios → `userService.ts`
- Helpers → `name.ts`
- Interfaces → `user.ts`
- Constantes → `user.ts`

## TypeScript

- No usar `any`.
- Tipar todo.
- Preferir `interface` para objetos y `type` para uniones.

## Componentes

- Máximo ~500 líneas.
- Si crecen, dividirlos.
- No consumir APIs directamente.

## Calidad

Antes de finalizar cualquier cambio verificar:

- Sin código duplicado.
- Sin imports sin usar.
- Sin variables sin usar.
- Tipado correcto.
- Código limpio y fácil de entender.

## Filosofía

Construir una base simple, modular y escalable. 
Cada archivo debe tener una única responsabilidad y cada cambio debe mejorar la calidad del proyecto.
Si de algo soy fan es de la velocidad, ux, suavidad, optimización.
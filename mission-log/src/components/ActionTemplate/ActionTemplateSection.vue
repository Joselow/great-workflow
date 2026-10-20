<script setup lang="ts">
import { actionRowStyle } from '@/helpers/cardColor'

import type { ActionTemplate } from '@/interfaces/actionTemplate'

defineProps<{
  title: string
  icon: string
  templates: ActionTemplate[]
}>()

const emit = defineEmits<{
  add: []
  edit: [template: ActionTemplate]
  delete: [template: ActionTemplate]
}>()
</script>

<template>
  <section class="flex min-w-0 flex-col rounded-lg border border-black/10 bg-white/60 p-3 dark:border-white/15 dark:bg-white/5">
    <div class="flex justify-between items-center">
      <h2 class="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <span class="material-symbols-outlined leading-none text-gray-500 dark:text-gray-300" style="font-size: 18px;">{{ icon }}</span>
        {{ title }}
      </h2>
      <button
        type="button"
        class="mt-2 inline-flex w-fit cursor-pointer items-center gap-1 rounded-md border 
        border-black/10 px-2 py-1 text-xs text-gray-700 
        hover:bg-green-500/30 
        dark:border-white/15 dark:text-gray-200 
        bg-green-500/20

        "
        :aria-label="`Agregar acción en ${title}`"
        :title="`Agregar acción en ${title}`"
        @click="emit('add')"
      >
        <span class="material-symbols-outlined leading-none" style="font-size: 18px;">add</span>
        
      </button>

    </div>

    <p v-if="templates.length === 0" class="text-center py-3 text-sm text-gray-500 dark:text-gray-400">Sin acciones</p>

    <ul v-else class="mt-2 flex flex-col gap-2">
      <li
        v-for="template in templates"
        :key="template.id"
        class="flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1"
        :style="actionRowStyle(template.color)"
      >
        <span
          class="h-3 w-3 shrink-0 rounded-full ring-0 ring-white/80 mt-1"
          :class="template.isActive ? 'bg-emerald-500' : 'bg-rose-500'"
          :title="template.isActive ? 'Activa' : 'Inactiva'"
        />
        <span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{{ template.name }}</span>
        <span
          v-if="template.card"
          class="inline-flex max-w-[42%] min-w-0 items-center gap-1 text-xs text-gray-700"
        >
          <span class="material-symbols-outlined shrink-0 leading-none" style="font-size: 18px;">link</span>
          <span class="truncate">{{ template.card.name }}</span>
        </span>
        <button
          type="button"
          class="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-gray-700 hover:bg-white/80"
          aria-label="Editar"
          title="Editar"
          @click="emit('edit', template)"
        >
          <span class="material-symbols-outlined leading-none" style="font-size: 18px;">edit</span>
        </button>
        <button
          type="button"
          class="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-gray-700 hover:bg-white/80 hover:text-rose-600"
          aria-label="Eliminar"
          title="Eliminar"
          @click="emit('delete', template)"
        >
          <span class="material-symbols-outlined leading-none" style="font-size: 18px;">delete</span>
        </button>
      </li>
    </ul>

    <div class="text-end">
     
    </div>
  </section>
</template>

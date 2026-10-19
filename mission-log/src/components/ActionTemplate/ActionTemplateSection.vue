<script setup lang="ts">
import type { ActionTemplate } from '@/interfaces/actionTemplate'

defineProps<{
  title: string
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
    <h2 class="text-sm font-semibold text-gray-900 dark:text-white">{{ title }}</h2>

    <p v-if="templates.length === 0" class="py-3 text-sm text-gray-500 dark:text-gray-400">Sin acciones</p>

    <ul v-else class="mt-2 flex flex-col gap-2">
      <li
        v-for="template in templates"
        :key="template.id"
        class="flex min-w-0 items-center gap-2 rounded-md border border-black/5 px-2 py-1.5 dark:border-white/10"
        :class="template.isActive ? '' : 'opacity-50'"
      >
        <span
          class="h-4 w-4 shrink-0 rounded-sm border border-black/10"
          :style="{ backgroundColor: template.color }"
        />
        <span class="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-white">{{ template.name }}</span>
        <span
          v-if="template.card"
          class="inline-flex max-w-[45%] min-w-0 items-center gap-1 text-xs text-gray-600 dark:text-gray-300"
        >
          <span class="material-symbols-outlined shrink-0 text-[16px] leading-none">link</span>
          <span class="truncate">{{ template.card.name }}</span>
        </span>
        <button
          type="button"
          class="cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          aria-label="Editar"
          @click="emit('edit', template)"
        >
          <span class="material-symbols-outlined text-[18px] leading-none">edit</span>
        </button>
        <button
          type="button"
          class="cursor-pointer text-rose-400 hover:text-rose-500"
          aria-label="Eliminar"
          @click="emit('delete', template)"
        >
          <span class="material-symbols-outlined text-[18px] leading-none">close</span>
        </button>
      </li>
    </ul>

    <button
      type="button"
      class="mt-3 inline-flex w-fit cursor-pointer items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-sm text-gray-700 hover:bg-black/5 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10"
      :aria-label="`Agregar acción en ${title}`"
      @click="emit('add')"
    >
      <span class="material-symbols-outlined text-[18px] leading-none">add</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ConfirmModal from '@/commons/ConfirmModal.vue'
import EmptyRecords from '@/commons/EmptyRecords.vue'

import type { Requirement } from '@/interfaces/requirement'

withDefaults(defineProps<{
  requirements: Requirement[]
  selectedId?: string | null
  pending?: boolean
  emptyMessage?: string
}>(), {
  selectedId: null,
  pending: false,
  emptyMessage: 'Aún no hay requerimientos',
})

const emit = defineEmits<{
  select: [requirement: Requirement]
  delete: [requirement: Requirement]
}>()

const confirmOpen = ref(false)
const pendingDelete = ref<Requirement | null>(null)

const askDelete = (requirement: Requirement) => {
  pendingDelete.value = requirement
  confirmOpen.value = true
}

const confirmDelete = () => {
  const requirement = pendingDelete.value
  confirmOpen.value = false
  pendingDelete.value = null
  if (!requirement) return
  emit('delete', requirement)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <EmptyRecords v-if="!requirements.length && !pending" :message="emptyMessage" />

    <article
      v-for="requirement in requirements"
      :key="requirement.id"
      class="rounded-xl border px-3 py-3"
      :class="selectedId === requirement.id
        ? 'border-brand-orange'
        : 'border-black/10 dark:border-white/15'"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          class="min-w-0 flex-1 cursor-pointer break-words text-left font-semibold text-gray-900 dark:text-white"
          @click="emit('select', requirement)"
        >
          {{ requirement.name }}
        </button>

        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-rose-500/40 px-2 py-1 text-rose-600 dark:text-rose-300"
          title="Eliminar"
          aria-label="Eliminar"
          @click="askDelete(requirement)"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </article>

    <ConfirmModal
      v-model="confirmOpen"
      title="¿Eliminar este requerimiento?"
      @confirm="confirmDelete"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        Las tareas de este requerimiento se conservan.
      </p>
    </ConfirmModal>
  </div>
</template>

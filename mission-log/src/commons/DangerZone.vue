<script setup lang="ts">
import ConfirmModal from '@/commons/ConfirmModal.vue'
import { useShowStates } from '@/composables/useShowStates'

const props = withDefaults(defineProps<{
  id: string
  loading?: boolean
  title?: string
  description: string
  actionLabel: string
  confirmTitle: string
  confirmDescription?: string
}>(), {
  loading: false,
  title: 'Zona de peligro',
  confirmDescription: 'Esta acción no se puede deshacer.',
})

const emit = defineEmits<{
  confirm: [id: string]
}>()

const { modalDelete, onModalDelete } = useShowStates('modalDelete')

const handleConfirm = () => {
  emit('confirm', props.id)
}
</script>

<template>
  <section
    class="mt-10 pt-6 border-t border-red-400 dark:border-white/10 flex justify-between items-center flex-wrap"
  >
    <ConfirmModal
      v-model="modalDelete"
      :title="confirmTitle"
      :loading="loading"
      @confirm="handleConfirm"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        {{ confirmDescription }}
      </p>
    </ConfirmModal>

    <div>
      <h2 class="text-md font-semibold text-gray-800 dark:text-gray-100">
        {{ title }}
      </h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ description }}
      </p>
    </div>
    <button
      type="button"
      class="mt-4 cursor-pointer rounded-lg border border-brand-pink/90 bg-brand-pink/10 text-brand-pink hover:bg-brand-pink hover:text-white font-semibold px-6 py-2.5 transition-colors"
      @click="onModalDelete"
    >
      <span class="material-symbols-outlined align-middle text-base">
        delete
      </span>
      {{ actionLabel }}
    </button>
  </section>
</template>

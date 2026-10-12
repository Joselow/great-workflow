<script setup lang="ts">
import { ref } from 'vue'
import ConfirmModal from '@/commons/ConfirmModal.vue'

const confirmOpen = ref(false)

const emit = defineEmits<{
  delete: []
}>()

const confirmDelete = () => {
  confirmOpen.value = false
  emit('delete')
}

</script>

<template>
  <div>
    <ConfirmModal
      v-model="confirmOpen"
      title="¿Eliminar esta reunión?"
      @confirm="confirmDelete"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        Esta acción no se puede deshacer.
      </p>
    </ConfirmModal>

    <button
      type="button"
      class="w-full cursor-pointer px-3 py-1.5 text-left text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400"
      role="menuitem"
      @click="confirmOpen = true"
    >
      <span class="material-symbols-outlined align-middle" style="font-size: 1.1rem;">delete</span>
      Eliminar
    </button>
  </div>
</template>

<style scoped>

</style>
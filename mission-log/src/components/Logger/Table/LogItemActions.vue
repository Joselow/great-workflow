<script setup lang="ts">
import ConfirmModal from '@commons/ConfirmModal.vue'

import { logStore } from '@/store/logStore';
import { textDataStore } from '@/store/textDataStore';

import { generateLogInfo } from '@/helpers/logInfo';
import { useShowStates } from '@/composables/useShowStates';

import type { Log } from '@/interfaces/Log';

interface Props {
  log: Log
}

const props = defineProps<Props>()

const emits = defineEmits<{
  delete: [log: Log]
}>()

const { selectLog } = logStore

const { modalDelete, onModalDelete, offModalDelete } = useShowStates('modalDelete');

const handleSelect = () => {
  selectLog(props.log)
}

const handleInfo = () => {
  const data = generateLogInfo(props.log)

  textDataStore.setTextData(data, 'markdown')
}

const handleConfirmDelete = () => {
  emits('delete', props.log)
  offModalDelete()
}
</script>

<template>
  <div class="flex shrink-0 items-center gap-1">
    <ConfirmModal
      v-model="modalDelete"
      title="¿Eliminar este registro?"
      @confirm="handleConfirmDelete"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer.</p>
    </ConfirmModal>

    <button class="cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold text-white transition-[filter] bg-brand-orange hover:brightness-95 active:brightness-90"
      @click="handleSelect"
    >
        Seleccionar
    </button>
    <button class="cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold text-white transition-[filter] bg-brand-cyan hover:brightness-95 active:brightness-90"
        @click="handleInfo"
        >
        Info
    </button>
    <button class="cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold text-white transition-[filter] bg-brand-pink hover:brightness-95 active:brightness-90"
        @click="onModalDelete"
        >
        Eliminar
    </button>
  </div>
</template>

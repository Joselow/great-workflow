<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

import StoreComment from './SaveComment.vue'
import LogStore from './LogStore.vue'
import CommonLoader from '@commons/CommonLoader.vue'
import ConfirmModal from '@commons/ConfirmModal.vue'

import { logStore } from '@/store/logStore.ts';
import { textDataStore } from '@/store/textDataStore.ts';

import { useLog } from '@/composables/useLog.ts';

import { errorToast } from '@/composables/useAlerts.ts';
import { useShowStates } from '@/composables/useShowStates.ts';

import { generateLogInfo } from '@/helpers/logInfo.ts';

import type { Log, NewLog, PartialLog } from '@/interfaces/Log.js';


const { selectLog, selectedLog, clearLog } = logStore
const { createLog, loading, updateLog } = useLog()

const emits = defineEmits<{
  create: [log: Log],
  update: [log: Log],
  delete: [log: Log],
}>()

const { modalConfirm, onModalConfirm, offModalConfirm } = useShowStates("modalConfirm");
const { modalDelete, onModalDelete, offModalDelete } = useShowStates("modalDelete");


const handleCreate = async (log: NewLog) => {
  const { success, data } = await createLog(log)

  if (success && data) {
    selectLog(data)

    const report = generateLogInfo(data)
    textDataStore.appendTextData(report, 'markdown')

    emits('create', data)
  }
}

const handleSaveComment = async (comment: string) => {
  if (!selectedLog.value?.id) {
    errorToast('There are not log selected')
    return
  }

  const { success, data } = await updateLog(selectedLog.value.id, {comment})

  if (success && data) {
    selectedLog.value.comment = comment
    emits('update', data)
  }
}

const handleUpdate = async (note: PartialLog) => {
  if (!note.id) {
    errorToast('There are not log selected to update')
    return
  }

  const { success, data } = await updateLog(note.id, note)

  if (success && data) {
    selectedLog.value = data

    const report = generateLogInfo(data)
    textDataStore.appendTextData(report, 'markdown')

    emits('update', data)
  }
}

const handleFinishTask = () => {
  if (!selectedLog.value?.id) {
    errorToast('There are not log selected to update')
    return
  }

  onModalConfirm()
}

const handleConfirmFinishTask = async() => {
  if (!selectedLog.value?.id) {
    errorToast('There are not log selected to update')
    return
  }

  const payload: PartialLog = {
    completed: !selectedLog.value.completed
  }

  if (!selectedLog.value.comment) {
    payload.comment = textDataStore.textData.value
  }

  const { success, data } = await updateLog(selectedLog.value.id, payload)

  if (success && data) {
    selectedLog.value = data
    emits('update', data)

    offModalConfirm()
  }
}

const handleDeleteTask = () => {
  if (!selectedLog.value?.id) {
    errorToast('There are not log selected to delete')
    return
  }

  onModalDelete()
}

const handleConfirmDelete = () => {
  if (!selectedLog.value?.id) {
    errorToast('There are not log selected to delete')
    return
  }

  emits('delete', selectedLog.value)
  offModalDelete()
}


const handleGenerateInfo = () => {
  if (!selectedLog.value?.id) {
    errorToast('There are not log selected to generate info')
    return
  }

  const data = generateLogInfo(selectedLog.value)

  textDataStore.appendTextData(data, 'markdown')
}

const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  const isTypingInField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'

  if (event.key === '+' && !isTypingInField) {
    if (selectedLog.value?.id) {
      event.preventDefault()
      clearLog()
    }
  }
};

onMounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.addEventListener('keydown', handleKeyDown);
})


onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div>
    <CommonLoader v-if="loading"/>

    <ConfirmModal
      v-model="modalConfirm"
      @confirm="handleConfirmFinishTask"
      :loading="loading"
    ></ConfirmModal>

    <ConfirmModal
      v-model="modalDelete"
      title="¿Eliminar este registro?"
      @confirm="handleConfirmDelete"
      :loading="loading"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer.</p>
    </ConfirmModal>

    <div class="mt-2">
      <LogStore
        @create="handleCreate"
        @update="handleUpdate"
      />
    </div>

    <div class="mt-4 flex flex-wrap items-start gap-6"
      v-if="selectedLog?.id"
    >
      <StoreComment
        @save="handleSaveComment"
      />

      <div class="flex flex-col gap-3">
        <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Estado</span>

        <button type="button"
          @click="handleFinishTask"
          class="cursor-pointer flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition-[filter] hover:brightness-95 active:brightness-90 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
          :disabled="loading"
          v-if="selectedLog?.completed"
          >
          <span>✓ Finalizado</span>
        </button>
        <button type="button"
          @click="handleFinishTask"
          class="cursor-pointer rounded-md border-2 border-emerald-500 dark:border-emerald-600/60 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-50"
           :disabled="loading"
           v-if="!selectedLog?.completed"
           >
          Finalizar
        </button>
      </div>

      <div class="flex flex-col gap-3">
        <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Acciones</span>

        <div class="flex flex-wrap gap-2">
          <button type="button"
            class="cursor-pointer rounded-md bg-brand-cyan px-4 py-1.5 text-xs font-semibold text-white transition-[filter] hover:brightness-95 active:brightness-90 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
            @click="handleGenerateInfo"
            >
            Informe
          </button>
          <button type="button"
            class="cursor-pointer rounded-md border-2 border-gray-300 dark:border-white/15 px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-300"
            @click="clearLog"
            >
            Quitar 
          </button>
          <button type="button"
            class="cursor-pointer rounded-md bg-brand-pink px-4 py-1.5 text-xs font-semibold text-white transition-[filter] hover:brightness-95 active:brightness-90 focus:outline-none focus:ring-2 focus:ring-brand-pink/40"
            @click="handleDeleteTask"
            >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

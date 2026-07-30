<script setup lang="ts">
import StoreComment from './SaveComment.vue'
import LogStore from './LogStore.vue'
import FullScreenLoader from '@commons/FullScreenLoader.vue'
import ConfirmModal from '@commons/ConfirmModal.vue'

import { logStore } from '@/store/logStore.ts';
import { textDataStore } from '@/store/textDataStore.ts';

import { useLog } from '@/composables/useLog.ts';

import { errorToast } from '@/composables/useAlerts.ts';
import { useShowStates } from '@/composables/useShowStates.ts';

import { generateLogInfo } from '@/helpers/logInfo.ts';

import type { Log, NewLog, PartialLog } from '@/interfaces/Log.js';


const { selectLog, selectedLog } = logStore
const { createLog, loading, updateLog } = useLog()

const emits = defineEmits<{
  create: [log: Log],
  update: [log: Log],
}>()

const { modalConfirm, onModalConfirm, offModalConfirm } = useShowStates("modalConfirm");


const handleCreate = async (log: NewLog) => {
  const { success, data } = await createLog(log)

  if (success && data) {
    selectLog(data)
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

  const { success, data } = await updateLog(selectedLog.value.id, {
    completed: !selectedLog.value.completed
  })

  if (success && data) {
    selectedLog.value = data
    emits('update', data)

    offModalConfirm()
  }
}


const handleGenerateInfo = () => {
  if (!selectedLog.value?.id) {
    errorToast('There are not log selected to generate info')
    return
  }

  const data = generateLogInfo(selectedLog.value)

  textDataStore.setTextData(data.trim())
}

</script>

<template>
  <div>
    <FullScreenLoader v-if="loading" />

    <ConfirmModal
      v-model="modalConfirm"
      @confirm="handleConfirmFinishTask"
      :loading="loading"
    ></ConfirmModal>
    
    <div class="mt-2">
      <LogStore
        @create="handleCreate"
        @update="handleUpdate"
      />
    </div>
    <div class="mt-4 flex gap-4 items-center">
      <StoreComment
        @save="handleSaveComment"
      />

      <div class="flex gap-4 flex-col items-star justify-center">
        <button type="button" 
          class="mt-6 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 
          py-2 me-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          @click="handleFinishTask"
          >
          Finalizar
        </button>
        <div class="flex gap-4">
          <!-- <button type="button" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-1 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
            Reunión
          </button>
          <button type="button" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-1 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
            Ver Detalles 
          </button> -->
          <button type="button" 
            class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-1 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            @click="handleGenerateInfo"
            >
            Informe
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
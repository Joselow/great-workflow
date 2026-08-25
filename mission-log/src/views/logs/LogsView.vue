<script setup lang="ts">
import {watch } from 'vue';

import LogForm from '@/components/Logger/Form/LogForm.vue';
import LogTable from '@/components/Logger/Table/LogTable.vue';
import LogFilters from '@/components/Logger/LogFilters.vue';
import CommonLoader from '@commons/CommonLoader.vue';

import { logStore } from '@/store/logStore';
import { projectStore } from '@/store/projectStore';

import { useLog } from '@/composables/useLog';
import { deleteFromArray, updateFromArray } from '@/utils/array';
import type { Log } from '@/interfaces/Log';

const { selectedLog, clearLog } = logStore
const { activeProject } = projectStore
const { loading, getLogs , logs, deleteLog } = useLog()

const fetchLogs = async () => {
  if (!activeProject.value?.id) return
  await getLogs(activeProject.value.id)
}

fetchLogs()

watch(activeProject, () => {
  clearLog()
  fetchLogs()
})

const handleCreateLog = (log: Log) => {
  logs.value.push(log)
}

const handleUpdateLog = (log: Log) => {
  logs.value = updateFromArray(logs.value, log)
}

const handleDeleteLog = async (log: Log) => {
  const { success } = await deleteLog(log.id)

  if (success) {
    logs.value = deleteFromArray(logs.value, log.id)

    if (selectedLog.value?.id === log.id) {
      clearLog()
    }
  }
}

</script>

<template>
  <div class="min-w-0 max-w-full">
    <CommonLoader v-if="loading"/>
    <div class="min-w-0 max-w-full mt-2 ms-0 md:ms-20 me-3 flex flex-col gap-4">
      <LogForm
        @create="handleCreateLog"
        @update="handleUpdateLog"
        @delete="handleDeleteLog"
      />

      <div>
        <LogFilters/>
        <LogTable class="mt-4"
          :logs="logs"
          @delete="handleDeleteLog"
        />
      </div>
    </div>
  </div>
</template>

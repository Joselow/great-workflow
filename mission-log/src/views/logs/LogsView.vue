<script setup lang="ts">
import LogForm from '@/components/Logger/Form/LogForm.vue';
import LogTable from '@/components/Logger/Table/LogTable.vue';
import LogFilters from '@/components/Logger/LogFilters.vue';
import SideBarText from '@commons/SideBarText.vue';
import CommonLoader from '@commons/CommonLoader.vue';


import { logStore } from '@/store/logStore';

import { useLog } from '@/composables/useLog';
import { deleteFromArray, updateFromArray } from '@/utils/array';
import type { Log } from '@/interfaces/Log';

const { selectedLog, clearLog } = logStore
const { loading, getLogs , logs, deleteLog } = useLog()

getLogs()


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
    <div class="flex min-w-0 max-w-full mt-2">
      <div class="ms-20 me-3 flex-1 min-w-0 flex flex-col gap-4">
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

      <SideBarText />
    </div>
  </div>
</template>

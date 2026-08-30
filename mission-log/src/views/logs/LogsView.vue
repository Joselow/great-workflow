<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import LogForm from '@/components/Logger/Form/LogForm.vue';
import LogTable from '@/components/Logger/Table/LogTable.vue';
import LogFilters from '@/components/Logger/LogFilters.vue';
import CommonLoader from '@commons/CommonLoader.vue';

import { logStore } from '@/store/logStore';
import { projectStore } from '@/store/projectStore';

import { useLog } from '@/composables/useLog';
import { errorToast } from '@/composables/useAlerts';
import { deleteFromArray, updateFromArray } from '@/utils/array';
import {
  defaultPeriod,
  isValidInclusiveRange,
  logMatchesFilters,
  weekForMonthChange,
  weekRangeForMonth,
} from '@/helpers/logPeriod';
import type { Log, LogViewFilters } from '@/interfaces/Log';

const { selectedLog, clearLog } = logStore
const { activeProject } = projectStore
const { loading, getLogs , logs, deleteLog } = useLog()

const createInitialFilters = (): LogViewFilters => {
  const { month, week } = defaultPeriod()
  const range = weekRangeForMonth(month, week)

  return {
    month,
    week,
    status: null,
    advanced: false,
    from: range.from,
    to: range.to,
  }
}

const filters = ref<LogViewFilters>(createInitialFilters())

const activeFilters = computed(() => ({
  from: filters.value.from,
  to: filters.value.to,
  ...(filters.value.status !== null ? { completed: filters.value.status } : {}),
}))

const fetchLogs = async () => {
  if (!activeProject.value?.id) return
  if (!isValidInclusiveRange(filters.value.from, filters.value.to)) return
  await getLogs(activeProject.value.id, activeFilters.value)
}

const handleFiltersUpdate = (next: LogViewFilters) => {
  const prev = filters.value

  if (next.month !== prev.month) {
    next = { ...next, week: weekForMonthChange(next.month) }
  }

  if (!next.advanced || (next.advanced && !prev.advanced)) {
    const range = weekRangeForMonth(next.month, next.week)
    next = { ...next, from: range.from, to: range.to }
  }

  if (next.advanced && next.from && next.to && next.from > next.to) {
    errorToast('La fecha de inicio no puede ser posterior a la fecha fin')
  }

  filters.value = next
}

watch(
  [activeProject, filters],
  () => {
    fetchLogs()
  },
  { immediate: true, deep: true },
)

const handleCreateLog = (log: Log) => {
  if (logMatchesFilters(log, { ...activeFilters.value, completed: filters.value.status })) {
    logs.value.push(log)
  }
}

const handleUpdateLog = (log: Log) => {
  if (logMatchesFilters(log, { ...activeFilters.value, completed: filters.value.status })) {
    logs.value = updateFromArray(logs.value, log)
  } else {
    logs.value = deleteFromArray(logs.value, log.id)
  }
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
  <div class="min-w-0 max-w-full overflow-x-hidden">
    <CommonLoader v-if="loading"/>
    <div class="min-w-0 max-w-full overflow-x-hidden mt-2 ms-0 md:ms-20 me-3 flex flex-col gap-4">
      <LogForm
        @create="handleCreateLog"
        @update="handleUpdateLog"
        @delete="handleDeleteLog"
      />

      <div>
        <h5 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Filtros
        </h5>
        <LogFilters
          :filters="filters"
          @update="handleFiltersUpdate"
        />
        <LogTable class="mt-4"
          :logs="logs"
          @delete="handleDeleteLog"
        />
      </div>
    </div>
  </div>
</template>

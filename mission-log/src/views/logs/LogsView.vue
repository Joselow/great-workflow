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
  weekCountForMonth,
  weekForMonthChange,
  weekRangeForMonth,
} from '@/helpers/logPeriod';
import type { Log } from '@/interfaces/Log';

const { selectedLog, clearLog } = logStore
const { activeProject } = projectStore
const { loading, getLogs , logs, deleteLog } = useLog()

const initialPeriod = defaultPeriod()
const initialRange = weekRangeForMonth(initialPeriod.month, initialPeriod.week)
const selectedMonth = ref(initialPeriod.month)
const selectedWeek = ref(initialPeriod.week)
const statusFilter = ref<boolean | null>(null)
const advancedDates = ref(false)
const customFrom = ref(initialRange.from)
const customTo = ref(initialRange.to)

const weekCount = weekCountForMonth()
const period = computed(() => {
  if (advancedDates.value) {
    return { from: customFrom.value, to: customTo.value }
  }
  return weekRangeForMonth(selectedMonth.value, selectedWeek.value)
})

const activeFilters = computed(() => ({
  from: period.value.from,
  to: period.value.to,
  ...(statusFilter.value !== null ? { completed: statusFilter.value } : {}),
}))

const fetchLogs = async () => {
  if (!activeProject.value?.id) return
  if (!isValidInclusiveRange(period.value.from, period.value.to)) return
  await getLogs(activeProject.value.id, activeFilters.value)
}

const handleMonthUpdate = (month: string) => {
  selectedMonth.value = month
  selectedWeek.value = weekForMonthChange(month)
}

const handleAdvancedUpdate = (value: boolean) => {
  if (value) {
    const range = weekRangeForMonth(selectedMonth.value, selectedWeek.value)
    customFrom.value = range.from
    customTo.value = range.to
  }
  advancedDates.value = value
}

const handleDateUpdate = (field: 'from' | 'to', value: string) => {
  if (field === 'from') customFrom.value = value
  else customTo.value = value

  if (!customFrom.value || !customTo.value) return
  if (customFrom.value > customTo.value) {
    errorToast('La fecha de inicio no puede ser posterior a la fecha fin')
  }
}

watch(activeProject, () => {
  clearLog()
})

watch(
  [activeProject, statusFilter, period, advancedDates],
  () => {
    fetchLogs()
  },
  { immediate: true },
)

const handleCreateLog = (log: Log) => {
  if (logMatchesFilters(log, { ...period.value, completed: statusFilter.value })) {
    logs.value.push(log)
  }
}

const handleUpdateLog = (log: Log) => {
  if (logMatchesFilters(log, { ...period.value, completed: statusFilter.value })) {
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
  <div class="min-w-0 max-w-full">
    <CommonLoader v-if="loading"/>
    <div class="min-w-0 max-w-full mt-2 ms-0 md:ms-20 me-3 flex flex-col gap-4">
      <LogForm
        @create="handleCreateLog"
        @update="handleUpdateLog"
        @delete="handleDeleteLog"
      />

      <div>
        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Filtros</h4>
        <LogFilters
          :month="selectedMonth"
          :week="selectedWeek"
          :week-count="weekCount"
          :status="statusFilter"
          :advanced="advancedDates"
          :from-date="customFrom"
          :to-date="customTo"
          @update:month="handleMonthUpdate"
          @update:week="selectedWeek = $event"
          @update:status="statusFilter = $event"
          @update:advanced="handleAdvancedUpdate"
          @update:fromDate="handleDateUpdate('from', $event)"
          @update:toDate="handleDateUpdate('to', $event)"
        />
        <LogTable class="mt-4"
          :logs="logs"
          @delete="handleDeleteLog"
        />
      </div>
    </div>
  </div>
</template>

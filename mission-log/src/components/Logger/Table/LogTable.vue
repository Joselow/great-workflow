<script setup lang="ts">
import LogItem from './LogItem.vue'
import EmptyRecords from '@commons/EmptyRecords.vue'

import type { Log } from '@/interfaces/Log';


const props = defineProps<{
  logs: Log[]
}>()

const emits = defineEmits<{
  delete: [log: Log]
}>()

</script>

<template>
    <div class="flex flex-col gap-1.5">
      <template v-if="!logs.length">
        <EmptyRecords message="Aún no hay registros" />
      </template>
      <template v-else>
        <LogItem
            v-for="log in logs"
              :key="log.id"
              :log="log"
              @delete="emits('delete', $event)"
          />
        </template>
    </div>
</template>

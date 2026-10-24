<script setup lang="ts">
import LogItem from './LogItem.vue'
import EmptyRecords from '@commons/EmptyRecords.vue'

import type { ActionTemplate } from '@/interfaces/actionTemplate';
import type { Log } from '@/interfaces/Log';


withDefaults(defineProps<{
  logs: Log[]
  templates?: ActionTemplate[]
}>(), {
  templates: () => [],
})

const emits = defineEmits<{
  delete: [log: Log]
}>()

</script>

<template>
    <div class="pretty-scroll flex flex-col gap-1.5 max-h-[100vh] min-w-0 overflow-y-auto overflow-x-hidden">
      <template v-if="!logs.length">
        <EmptyRecords class="mt-10" message="Aún no hay registros" />
      </template>
      <template v-else>
        <LogItem
            v-for="log in logs"
              :key="log.id"
              :log="log"
              :templates="templates"
              @delete="emits('delete', $event)"
          />
        </template>
    </div>
</template>

<script setup lang="ts">

import { logStore } from '@/store/logStore';
import { textDataStore } from '@/store/textDataStore';

import { generateLogInfo } from '@/helpers/logInfo';

import type { Log } from '@/interfaces/Log';

const { selectLog } = logStore

interface Props {
  log: Log
}

const props = defineProps<Props>()


const handleSelectLog = (log: Log) => {
    selectLog(log)
}

const showInfo = (log: Log) => {
  const data = generateLogInfo(log)  

  textDataStore.setTextData(data)
}
</script>

<template>
    <div>
        <div class="w-full rounded-lg py-1  px-4 border border-2
          flex justify-between items-center
        ">
          <div class="flex gap-4">
              <span>{{ log.description }}</span>
              <span>{{ log.responsible }}</span>
              <span>{{ log.tags }}</span>
              
          </div>
          <div class="flex gap-2">
              <button class="cursor-pointer rounded-md bg-yellow-400 hover:bg-yellow-300 px-3 py-1 shadow-md 
                text-black"
                @click="handleSelectLog(log)"
              >
                  Select
              </button>
              <button class="cursor-pointer rounded-md 
                  bg-sky-400 hover:bg-sky-300 px-3 py-1 shadow-md text-white"
                  @click="showInfo(log)"
                  >
                  Info
              </button>
              {{ log.completed ? 'Finalizado' : '' }}
          </div>
        </div>
    </div>
</template>

<style scoped>

</style>
<script setup lang="ts">
import LogComment from './LogComment.vue'
import LogStore from './LogStore.vue'
import FullScreenloader from '@commons/FullScreenloader.vue'

import type { NewLog } from '@/interfaces/Log.js';

import { useLog } from '@/composables/useLog.ts';


const { createLog, loading } = useLog()

const handleCreate = (log: NewLog) => {
  createLog(log)
}
</script>

<template>
  <div>
    <FullScreenloader v-if="loading" />
    
    <div class="mt-2">
      <LogStore
      @create="handleCreate"
      />
    </div>
    <div class="mt-4 flex gap-4 items-center">
      <LogComment/>

      <div class="flex gap-4 flex-col items-star justify-center">
        <button type="button" 
        class="mt-6 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 
        py-2 me-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
          Finalizar
        </button>
        <div class="flex gap-4">
          <!-- <button type="button" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-1 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
            Reunión
          </button>
          <button type="button" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-1 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
            Ver Detalles 
          </button> -->
          <button type="button" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-1 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
            Informe
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
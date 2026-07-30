<script setup lang="ts">
import { ref } from 'vue'

import LogForm from '@/components/Logger/Form/LogForm.vue';
import LogTable from '@/components/Logger/Table/LogTable.vue';
import LogFilters from '@/components/Logger/LogFilters.vue';
import SideBarText from '@commons/SideBarText.vue';

import FullScreenLoader from '@commons/FullScreenLoader.vue'

import { textDataStore } from '@/store/textDataStore';

import { useLog } from '@/composables/useLog';
import type { Log } from '@/interfaces/Log';

const { textData } = textDataStore
const { loading, getLogs , logs  } = useLog()

getLogs()


const handleCreateLog = (log: Log) => {
  logs.value.push(log)
}

const handleUpdateLog = (log: Log) => {
  const index = logs.value.findIndex(({ id }) => id === log.id)

  if (index !== -1) {
    logs.value[index] = log
  }
}

</script>

<template>
  <div>
    <FullScreenLoader v-if="loading"/>
    <div class="grid grid-cols-9 gap-4 grid-rows-4">
      <section class="col-span-7 ">
          <LogForm
            @create="handleCreateLog"
            @update="handleUpdateLog"
          /> 
      </section>
  
      <section class="col-span-2 row-span-4 rounded-lg border border-2">
        <SideBarText
          :textData="textData"
        /> 
      </section> 
  
      <section class="col-span-7  "> 
        <LogFilters/>
        <LogTable class="mt-4"
          :logs="logs"
        /> 
      </section> 
  
    </div>  
  </div>
</template>

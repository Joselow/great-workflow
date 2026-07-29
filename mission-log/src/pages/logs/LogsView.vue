<script setup lang="ts">
import { ref } from 'vue'

import LogForm from '@/components/Logger/Form/LogForm.vue';
import LogTable from '@/components/Logger/LogTable.vue';
import LogFilters from '@/components/Logger/LogFilters.vue';
import SideBarText from '@commons/SideBarText.vue';

import FullScreenLoader from '@commons/FullScreenLoader.vue'


import { useLog } from '@/composables/useLog';

const { loading, getLogs , logs  } = useLog()

getLogs()


</script>

<template>
  <div>
    <FullScreenLoader v-if="loading"/>
    <div class="grid grid-cols-9 gap-4 grid-rows-4">
      <section class="col-span-7 ">
          <LogForm/> 
      </section>
  
      <section class="col-span-2 row-span-4 rounded-lg border border-2">
        <SideBarText/> 
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

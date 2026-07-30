<script setup lang="ts">
import LogItem from './LogItem.vue'

import type { Log } from '@/interfaces/Log';


const props = defineProps<{
  logs: Log[]
}>()

</script>

<template>
    <div class="border border-2">
        <template v-for="log in logs">
            <LogItem
                :log="log"
            />
        </template>
    </div>

</template>
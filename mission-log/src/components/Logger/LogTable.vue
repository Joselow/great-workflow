<script setup lang="ts">
import type { Log } from '@/interfaces/Log';


const props = defineProps<{
  logs: Log[]
}>()

</script>

<template>
    <div class="border border-2">
        <template v-for="log in logs">
            <div class="rounded-lg bg-gray-300">
                <span>{{  log.description  }}</span>
                <span>{{  log.responsible  }}</span>
                <span>{{  log.tags  }}</span>
            </div>
        </template>
    </div>

</template>
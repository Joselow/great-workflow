<script setup lang="ts">
import { PROJECT_COLORS } from '@/constants/projectColors'

const model = defineModel<string>({ required: true })

const selectColor = (value: string) => {
  model.value = value
}
</script>

<template>
  <div class="rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 p-3">
    <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Color</p>
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="option in PROJECT_COLORS"
        :key="option.id"
        type="button"
        class="w-7 h-7 rounded-md border transition-all cursor-pointer hover:scale-105"
        :class="model === option.value
          ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 border-indigo-600'
          : 'border-black/10 dark:border-white/15'"
        :style="{ backgroundColor: option.value }"
        :title="option.label"
        @click="selectColor(option.value)"
      />
    </div>
  </div>
</template>

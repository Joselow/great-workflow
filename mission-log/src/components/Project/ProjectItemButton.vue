<script setup lang="ts">
import type { PartialProject } from '@/interfaces/project'

defineProps<{
  project: PartialProject
  selected?: boolean
  itemStyle?: {
    borderColor: string
    backgroundColor: string
  }
}>()

const emit = defineEmits<{
  select: []
  activate: []
}>()
</script>

<template>
  <button
    type="button"
    class="w-full cursor-pointer rounded-lg border overflow-hidden px-3 py-2 text-left transition-colors"
    :class="{
      'border-brand-orange/60 bg-brand-orange/10': selected,
      'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5':
        !selected && !itemStyle,
    }"
    :style="itemStyle"
    @dblclick="emit('activate')"
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2 min-w-0">
        <span
          class="w-4 h-4 rounded-md shrink-0 border border-black/10"
          :style="{ backgroundColor: project.color }"
        />
        <span
          class="truncate text-sm font-medium"
          :class="
            !project.id
              ? 'text-gray-400 dark:text-gray-400'
              : 'text-gray-800 dark:text-gray-100'
          "
        >
          {{ project.name || 'Nuevo Proyecto' }}
        </span>
      </div>
      <div>
        <button
          type="button"
          class="cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-1 rounded-md
            hover:scale-112 transition-transform duration-200"
          @click="emit('select')"
        >
          <span
            style="font-size: 22px;"
            class="material-symbols-outlined align-middle"
          >
            expand_circle_right
          </span>
        </button>
      </div>
    </div>
  </button>
</template>

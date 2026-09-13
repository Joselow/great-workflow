<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import PopoverBase from '@/commons/PopoverBase.vue'
import { PROJECT_COLORS } from '@/constants/projectColors'
import { isLightHex } from '@/helpers/cardColor'

const model = defineModel<string>({ required: true })

withDefaults(defineProps<{
  variant?: 'panel' | 'button'
}>(), {
  variant: 'panel',
})

const stripHash = (value: string) => value.replace(/^#/, '').slice(0, 6)

const toHexColor = (value: string) => {
  const clean = value.replace(/[^0-9a-fA-F]/g, '')

  if (clean.length === 6) return `#${clean}`
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`
  }

  return null
}

const hexOpen = ref(false)
const hexDraft = ref(stripHash(model.value))
const hexInput = ref<HTMLInputElement | null>(null)

const isCustomColor = computed(() =>
  !PROJECT_COLORS.some(
    (option) => option.value.toLowerCase() === model.value.toLowerCase()
  )
)

const selectColor = (value: string) => {
  model.value = value
  hexDraft.value = stripHash(value)
}

const applyHexDraft = () => {
  const next = toHexColor(hexDraft.value)
  if (next) model.value = next
}

const handleHexInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  hexDraft.value = target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)

  if (hexDraft.value.length === 6) {
    applyHexDraft()
  }
}

const togglePicker = async () => {
  hexOpen.value = !hexOpen.value
  if (!hexOpen.value) return
  hexDraft.value = stripHash(model.value)
  await nextTick()
  hexInput.value?.focus()
  hexInput.value?.select()
}
</script>

<template>
  <div
    v-if="variant === 'panel'"
    class="rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 p-3"
  >
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

      <PopoverBase v-model="hexOpen">
        <template #trigger>
          <button
            type="button"
            class="ml-3 cursor-pointer hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1"
            :class="hexOpen || isCustomColor
              ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900'
              : ''"
            @click="togglePicker"
          >
            <span class="material-symbols-outlined align-middle">
              colors
            </span>
            Elegir color
          </button>
        </template>

        <p class="text-xs text-gray-500 dark:text-white/70 mb-1.5">Hex</p>
        <label class="flex items-center gap-1.5 rounded-md border border-black/10 dark:border-white/15 bg-gray-50 dark:bg-black/30 px-2 py-1.5">
          <span class="text-sm text-gray-400 dark:text-white/50 select-none">#</span>
          <input
            ref="hexInput"
            :value="hexDraft"
            type="text"
            maxlength="6"
            spellcheck="false"
            autocomplete="off"
            class="w-full bg-transparent text-sm text-gray-800 dark:text-white outline-none font-mono tracking-wide"
            @input="handleHexInput"
            @blur="applyHexDraft"
            @keydown.enter.prevent="applyHexDraft"
          />
        </label>
      </PopoverBase>
    </div>
  </div>

  <PopoverBase
    v-else
    v-model="hexOpen"
    placement="left"
  >
    <template #trigger>
      <button
        type="button"
        class="h-11 w-12 shrink-0 cursor-pointer rounded-lg border hover:scale-105 transition-transform"
        :class="isLightHex(model)
          ? 'border-zinc-400/70 shadow-sm dark:border-white/35'
          : 'border-black/10 dark:border-white/10 shadow-sm'"
        :style="{ backgroundColor: model }"
        title="Color de la card"
        @click="togglePicker"
      />
    </template>

    <div class="flex flex-wrap items-center gap-2 max-w-72">
      <button
        v-for="option in PROJECT_COLORS"
        :key="option.id"
        type="button"
        class="w-7 h-7 rounded-lg border transition-all cursor-pointer hover:scale-105"
        :class="model.toLowerCase() === option.value.toLowerCase()
          ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-[#2b2b2b]'
          : 'border-black/10 dark:border-white/15'"
        :style="{ backgroundColor: option.value }"
        :title="option.label"
        @click="selectColor(option.value)"
      />

      <label class="flex items-center gap-1 rounded-full border border-black/10 dark:border-white/15 bg-gray-50 dark:bg-black/30 px-2.5 py-1">
        <span class="text-xs text-gray-400 dark:text-white/50 select-none">#</span>
        <input
          ref="hexInput"
          :value="hexDraft"
          type="text"
          maxlength="6"
          spellcheck="false"
          autocomplete="off"
          class="w-16 bg-transparent text-xs text-gray-800 dark:text-white outline-none font-mono tracking-wide"
          @input="handleHexInput"
          @blur="applyHexDraft"
          @keydown.enter.prevent="applyHexDraft"
        />
      </label>
    </div>
  </PopoverBase>
</template>

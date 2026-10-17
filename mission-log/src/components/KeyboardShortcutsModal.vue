<script setup lang="ts">
import { computed } from 'vue'

import ModalBase from '@/commons/ModalBase.vue'
import { keyboardCommands } from '@/composables/useKeyboardCommands'

import type { KeyboardCommandGroup } from '@/composables/useKeyboardCommands'

const { commands, closeHelp } = keyboardCommands

const helpOpen = computed({
  get: () => keyboardCommands.helpOpen.value,
  set: (open: boolean) => {
    keyboardCommands.helpOpen.value = open
  },
})

const groups: { id: KeyboardCommandGroup; title: string; tone: string }[] = [
  { id: 'navigate', title: 'Navegar', tone: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-200' },
  { id: 'panels', title: 'Paneles', tone: 'bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-200' },
  { id: 'logs', title: 'Logs', tone: 'bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-200' },
  { id: 'help', title: 'Ayuda', tone: 'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200' },
]

const grouped = computed(() =>
  groups
    .map((group) => ({
      ...group,
      items: commands.filter((command) => command.group === group.id),
    }))
    .filter((group) => group.items.length > 0),
)

const kbdClass = 'rounded-md border border-black/10 bg-white px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-200'
</script>

<template>
  <ModalBase v-model="helpOpen" maxWidth="md" centered>
    <div class="flex max-h-[min(85dvh,40rem)] flex-col bg-[#f7f6fb] text-gray-800 dark:bg-[#23232b] dark:text-gray-100">
      <div class="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4 dark:border-white/10">
        <h2 class="text-lg font-semibold">Atajos de teclado</h2>

        <div class="flex items-center gap-2">
          <kbd :class="kbdClass">esc</kbd>
          <button
            type="button"
            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Cerrar"
            @click="closeHelp"
          >
            <span class="material-symbols-outlined text-[20px] leading-none">close</span>
          </button>
        </div>
      </div>

      <div class="overflow-y-auto px-5 py-4">
        <div class="space-y-5">
          <section v-for="group in grouped" :key="group.id">
            <h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {{ group.title }}
            </h3>

            <ul class="mt-2">
              <li
                v-for="command in group.items"
                :key="command.id"
                class="flex items-center justify-between gap-4 border-b border-black/5 py-2.5 last:border-b-0 dark:border-white/10"
              >
                <span class="flex min-w-0 items-center gap-3 text-sm">
                  <span
                    class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                    :class="group.tone"
                  >
                    <span class="material-symbols-outlined text-[18px] leading-none">{{ command.icon }}</span>
                  </span>
                  <span class="min-w-0">
                    {{ command.label }}
                    <span v-if="command.scopeLabel" class="ml-2 text-xs text-gray-400 dark:text-gray-500">
                      {{ command.scopeLabel }}
                    </span>
                  </span>
                </span>

                <span class="flex shrink-0 items-center gap-1">
                  <kbd
                    v-for="key in command.keys"
                    :key="key"
                    :class="kbdClass"
                  >
                    {{ key }}
                  </kbd>
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </ModalBase>
</template>

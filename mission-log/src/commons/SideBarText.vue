<script setup lang="ts">
import { textDataStore } from '@/store/textDataStore';
import { successToast, errorToast } from '@/composables/useAlerts';

const { textData, format, expanded, toggleExpanded, clearTextData } = textDataStore

const actionClass = 'inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs shadow-sm transition-colors'

const handleCopy = async () => {
  if (!textData.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(textData.value)
    successToast('✓ Copiado')
  } catch {
    errorToast('No se pudo copiar el texto')
  }
}

const handleClear = () => {
  if (!textData.value) {
    toggleExpanded()
  } {
    clearTextData()
  }

}
</script>

<template>
  <aside
    class="fixed inset-x-0 bottom-0 z-40 flex shrink-0 flex-col overflow-hidden
      border border-black/10 bg-white/95 shadow-[0_-4px_12px_rgba(0,0,0,0.12)] backdrop-blur-sm
      transition-[width,height] duration-300
      dark:border-white/10 dark:bg-zinc-950/95
      rounded-t-lg
      md:sticky md:bottom-auto md:left-auto md:right-auto md:top-[4.75rem] md:z-auto
      md:h-[calc(100dvh-5.75rem)] md:max-h-[calc(100dvh-5.75rem)] md:min-h-0
      md:flex-row md:self-start
      md:rounded-t-none md:rounded-l-md md:border-y md:border-l
      md:bg-white/60 md:shadow-sm md:dark:bg-white/5"
    :class="expanded ? 'h-[80dvh] md:w-96' : 'h-10 md:w-4'"
  >
    <div
      class="flex h-10 w-full shrink-0 items-center bg-teal-500/70 text-white/80 md:h-auto md:w-4 md:flex-col"
    >
      <button
        type="button"
        class="flex h-full min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 transition-colors hover:text-white md:w-full"
        title="Clic para expandir o contraer"
        @click="toggleExpanded"
      >
        <span class="select-none text-xs font-medium tracking-wide max-md:truncate md:text-[11px] md:leading-none md:[writing-mode:vertical-rl]">
          Writer {{ expanded ? '▲' : '▼' }}
        </span>
      </button>

      <div v-if="expanded" class="flex shrink-0 items-center gap-1.5 pr-2 md:hidden">
        <button
          type="button"
          :class="[actionClass, 'bg-red-400/50 text-gray-900 hover:text-red-700 dark:bg-red-500/50 dark:text-gray-300']"
          title="Limpiar texto"
          @click="handleClear"
        >
          <span class="material-symbols-outlined align-middle text-xs leading-none">cleaning_services</span>
          Limpiar
        </button>
        <button
          type="button"
          :class="[actionClass, 'bg-cyan-400/50 text-gray-600 hover:text-cyan-600 dark:bg-cyan-500/50 dark:text-gray-300']"
          title="Copiar texto"
          @click="handleCopy"
        >
          <span class="material-symbols-outlined align-middle text-xs leading-none">file_copy</span>
          Copiar
        </button>
      </div>
    </div>

    <div v-if="expanded" class="pretty-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
      <div class="hidden shrink-0 items-center justify-end gap-2 px-2 py-1.5 md:flex">
        <button
          type="button"
          :class="[actionClass, 'bg-red-400/50 text-gray-900 hover:text-red-700 dark:bg-red-500/50 dark:text-gray-300']"
          title="Limpiar texto"
          @click="handleClear"
        >
          <span class="material-symbols-outlined align-middle text-xs leading-none">cleaning_services</span>
          Limpiar
        </button>
        <button
          type="button"
          :class="[actionClass, 'bg-cyan-400/50 text-gray-600 hover:text-cyan-600 dark:bg-cyan-500/50 dark:text-gray-300']"
          title="Copiar texto"
          @click="handleCopy"
        >
          <span class="material-symbols-outlined align-middle text-xs leading-none">file_copy</span>
          Copiar
        </button>
      </div>

      <textarea
        class="min-h-0 w-full flex-1 resize-none overflow-y-auto border-0 border-l-2 bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-gray-400"
        :class="format === 'markdown'
          ? 'border-brand-cyan text-sky-900 dark:text-sky-500'
          : 'border-transparent text-gray-700 dark:text-gray-200'"
        rows="20"
        v-model="textData"
      ></textarea>
    </div>
  </aside>
</template>

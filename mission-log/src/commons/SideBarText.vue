<script setup lang="ts">
import { textDataStore } from '@/store/textDataStore';
import { successToast, errorToast } from '@/composables/useAlerts';

const { textData, format, expanded, toggleExpanded, clearTextData } = textDataStore

const handleCopy = async () => {
  if (!textData.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(textData.value)
    successToast('✓ Copiado')
  } catch (err) {
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
    class="flex flex-col md:flex-row shrink-0
      fixed inset-x-0 bottom-0 z-40
      md:relative md:inset-auto md:z-auto md:self-stretch
      rounded-t-lg md:rounded-t-none md:rounded-l-md
      border md:border-y md:border-l border-black/10 dark:border-white/10
      bg-white/95 md:bg-white/60 dark:bg-zinc-950/95 md:dark:bg-white/5
      backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.12)] md:shadow-sm
      overflow-visible transition-[width] duration-300
      min-h-[calc(100dvh-150px)]"
    :class="expanded ? 'w-full md:w-96' : 'w-full md:w-4'"
  >
    <button type="button"
      class="bg-teal-500/70 flex shrink-0 items-center justify-center gap-1 cursor-pointer text-white/80 hover:text-white transition-colors w-full h-10 md:h-auto"
      :class="expanded ? 'md:w-3' : 'md:w-4'"
      title="Doble clic para expandir/contraer"
      @dblclick="toggleExpanded"
      @click="toggleExpanded"
    >
      <span class="text-xs font-medium tracking-wide md:[writing-mode:vertical-rl] select-none">
        Writer {{ expanded ? '▲' : '▼' }}
      </span>
    </button>

    <div
      v-show="expanded"
      class="absolute -top-7 right-2 z-10 "
    >
      <div class="flex items-center gap-4">
       
        <button type="button"
          v-show="expanded"
          class="px-3 cursor-pointer rounded-md bg-red-400/50 dark:bg-red-500/50 px-2 py-1 text-xs text-gray-900 dark:text-gray-300 hover:text-red-700  transition-colors shadow-sm"
          title="Copiar texto"
          @click="handleClear"
        >
        <span class="text-xs material-symbols-outlined leading-none align-middle">cleaning_services</span>

          Limpiar
        </button>
        <button type="button"
          v-show="expanded"
          class="px-3 cursor-pointer rounded-md bg-cyan-400/50 dark:bg-cyan-500/50 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-cyan-600 transition-colors shadow-sm"
          title="Copiar texto"
          @click="handleCopy"
        >
        <span class="text-xs  material-symbols-outlined leading-none align-middle">
          file_copy
        </span>
            Copiar
          </button>

      </div>
    </div>

    <div v-if="expanded" class="relative flex-1 min-h-0 min-w-0">
      <textarea
        class="w-full h-full resize-none bg-transparent px-3 py-2 pr-16 text-sm focus:outline-none placeholder:text-gray-400 border-0 border-l-2"
        :class="format === 'markdown'
          ? 'text-sky-900 dark:text-sky-500 border-brand-cyan'
          : 'text-gray-700 dark:text-gray-200 border-transparent'"
        rows="20"
        v-model="textData"
      ></textarea>
    </div>
  </aside>
</template>

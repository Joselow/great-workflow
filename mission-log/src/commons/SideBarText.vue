<script setup lang="ts">
import { ref, watch } from 'vue';


interface Props {
  textData?: string
}

const props = defineProps<Props>()

const data = ref('')
const expanded = ref(false)

watch(() => props.textData, (value) => {
  if (value) {
    data.value = value
    expanded.value = true
  } else {
    data.value = ''
  }
});

const toggleExpanded = () => {
  expanded.value = !expanded.value
}
</script>

<template>
  <aside class="flex shrink-0 self-stretch rounded-l-md border-y border-l border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm shadow-sm overflow-hidden transition-[width] duration-300"
    :class="expanded ? 'w-96' : 'w-4'"
  >
    <button type="button"
      class="bg-teal-500/70 flex shrink-0 items-center justify-center cursor-pointer text-white/80 hover:text-white transition-colors"
      :class="expanded ? 'w-3' : 'w-4'"
      title="Doble clic para expandir/contraer"
      @dblclick="toggleExpanded"
      @click="toggleExpanded"
    >
      <span class="text-xs font-medium tracking-wide [writing-mode:vertical-rl] select-none">Writter</span>
    </button>

    <textarea v-if="expanded"
      class="w-full min-h-full resize-none bg-transparent px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none placeholder:text-gray-400"
      rows="20"
      v-model="data"
    ></textarea>
  </aside>
</template>

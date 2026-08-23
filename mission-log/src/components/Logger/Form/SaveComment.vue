<script setup lang="ts">
import { ref, watch } from 'vue';

import { logStore } from '@/store/logStore';



const emits =  defineEmits<{
  save: [comment: string]
}>()

const comment = ref<string>('')

let lastComment = ''

const saveComment = async () => {
  if (!comment.value || comment.value.trim() === lastComment.trim()) return

  emits('save', comment.value)
  lastComment = comment.value
}

watch(logStore.selectedLog, (value) => {
  comment.value = value?.comment ?? ''
  lastComment = comment.value
})

</script>

<template>
  <div>
    <label for="message" class="block mb-2.5 text-sm font-medium text-gray-600 dark:text-gray-300">Comentario</label>
    <textarea id="message" rows="2"
      class="rounded-xl bg-white/60 dark:bg-white/5 border border-black/30 dark:border-white/10 text-gray-700 dark:text-gray-200 text-sm block
      w-90 p-2.5 shadow-xs placeholder:text-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-brand-orange/60 dark:focus:ring-brand-orange/50" placeholder="Escribe una reflexión, idea, dato adicional"
      v-model="comment"
      >
    </textarea>
    <div class="text-end mt-2">
      <button type="button" class="w-full focus:outline-none text-white bg-brand-orange hover:brightness-95 active:brightness-90 focus:ring-2 focus:ring-brand-orange/40 font-semibold rounded-lg text-sm px-5
          py-1.5 mb-2 transition-[filter]
          "
          @click="saveComment"
          >
          Actualizar Comentario
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>
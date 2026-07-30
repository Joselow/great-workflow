<script setup lang="ts">
import { ref, watch } from 'vue';

import { logStore } from '@/store/logStore';



const emits =  defineEmits<{
  save: [comment: string]
}>()

const comment = ref<string>('')

const saveComment = async () => {
  if (!comment.value) return

  emits('save', comment.value)
}


watch(logStore.selectedLog , (value) => {
  
  if (value?.comment) {
    comment.value = value.comment
  } else {
    comment.value = ''
  }
});

</script>

<template>
  <div>
    <label for="message" class="block mb-2.5 text-sm font-medium text-heading">Comentario</label>
    <textarea id="message" rows="2" 
      class="rounded-lg bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block 
      w-90 p-2  shadow-xs placeholder:text-body" placeholder="Escribe una reflexión, idea, dato adicional"
      v-model="comment"
      >
    </textarea>
    <div class="text-end mt-2">
      <button type="button" class=" focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 
          py-1.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
          @click="saveComment"
          >
          Guardar Comentario
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>
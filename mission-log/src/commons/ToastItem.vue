<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

interface Props {
  id?: string 
  msg?: string
  time?: number
  css?: string  
  html?: boolean
}

const props = defineProps<Props>();
const emits = defineEmits<{
  remove: [id?: string];
}>();

const timer = ref()

const handleToast = () => {
  if (props.time && props.id) {
    handleRemoveToastWithId();
  } else if (props.time) {
    handleRemoveToast()
  }
}

const handleRemoveToastWithId = () => {
  timer.value = setTimeout(() => emits('remove', props.id), props.time);
}

const handleRemoveToast = () => {
  timer.value = setTimeout(() => emits('remove'), props.time)   
}

const hideByClick = () =>{
  if (props.id) {
    emits('remove', props.id!)
  } else {
    emits('remove')
  }
}

handleToast()

onUnmounted(() => {
  clearTimeout(timer.value)
})
</script>


<template>
  <!-- <div> -->
    <div class="relative bg-gray-800/90 dark:bg-white/10 backdrop-blur-sm text-white rounded-lg py-2 px-6 shadow-lg flex justify-between gap-3 min-w-48"
      :class="css"
    >
      <div class="me-4">
        <slot>
          <template v-if="html">
            <section v-html="msg"/>            
          </template>
          <template v-else>
            {{ msg?? 'Writte Your message man 😠' }} 
          </template>
        </slot>
      </div>
      <!-- <button class=" hover:boder text-red-200 rounded-md hover:text-red-500 transition duration-300" -->
      <button class="absolute top-2 right-4  text-red-100 rounded-md hover:text-red-500 transition duration-300"
        @click="hideByClick" 
      >
        x
      </button>
    </div>
  <!-- </div> -->
</template>
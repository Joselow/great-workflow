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
    <div class="bg-gray-800/90 relative backdrop-blur-sm text-white rounded-lg py-2 px-6 shadow-lg flex justify-between gap-3 min-w-48"
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
      <button class="hover:scale-125 cursor-pointer px-2 absolute top-2 right-0 text-2xl text-gray-100 rounded-md hover:text-white transition duration-300"
        @click="hideByClick" 
      >
      <svg  class="text-gray-100" width="26px" height="26px" viewBox="0 0 20 20" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.17158 14.2426C6.78106 14.6332 6.14789 14.6332 5.75737 14.2426C5.36684 13.8521 5.36684 13.2189 5.75737 12.8284L12.8284 5.75735C13.219 5.36682 13.8521 5.36682 14.2427 5.75735C14.6332 6.14787 14.6332 6.78104 14.2427 7.17156L7.17158 14.2426Z" fill="currentColor"></path> <path d="M5.75737 7.17152C5.36684 6.781 5.36684 6.14783 5.75737 5.75731C6.14789 5.36679 6.78106 5.36679 7.17158 5.75731L14.2427 12.8284C14.6332 13.2189 14.6332 13.8521 14.2427 14.2426C13.8521 14.6331 13.219 14.6331 12.8284 14.2426L5.75737 7.17152Z" fill="currentColor"></path> </g></svg>
      </button>
    </div>
  <!-- </div> -->
</template>
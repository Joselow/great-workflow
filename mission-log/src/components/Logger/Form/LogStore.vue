<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import type { NewLog } from '@/interfaces/Log';

const emits = defineEmits<{
  create: [log: NewLog]
}>()

const noteDefault: NewLog = {
    description: '',
    tags: '',
    responsible: '',
}

const note = reactive({...noteDefault})

const descriptionRef = ref<HTMLInputElement | null>(null)

const onTab = (e: Event) => {
    if (note.description && note.tags && note.responsible) {
        emits('create', note) 
    }
}

onMounted(()=>{
    if (descriptionRef.value) {
        descriptionRef.value.focus()
    }
})
</script>

<template>
  <div>
    <div class="flex gap-1 justify-between">
        <div class="relative z-0 w-90  mb-5 group">
            <input type="desc" name="floating_desc" id="floating_desc" 
                ref="descriptionRef"
                class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer" 
                placeholder="" required 
                v-model="note.description"
                />
            <label for="floating_desc" class="peer-focus:font-medium absolute text-md text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-red-600 peer-focus:dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Descripción
            </label>
        </div>
      <!-- <div >
        <label for="price" class="block text-sm/6 font-medium ">Descripción</label>
        <div class="mt-2">
            <input id="price" type="text" name="price" placeholder="" 
            class="px-2 w-90 rounded-lg block min-w-0 grow bg-gray-800 py-1.5 pr-3 pl-1 text-base  placeholder:text-gray-500 focus:outline-none sm:text-sm/6" />
        </div>
      </div> -->
        <div class="relative z-0 w-50  mb-5 group">
            <input type="who" name="floating_who" id="floating_who" 
                class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer" 
                placeholder="" required 
                v-model="note.responsible"
                />
            <label for="floating_who" class="peer-focus:font-medium absolute text-md text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-red-600 peer-focus:dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Quien
            </label>
        </div>
      <!-- <div>
        <label for="price" class="block text-sm/6 font-medium ">Quien</label>
        <div class="mt-2">
            <input id="price" type="text" name="price" placeholder="" 
            class="w-50 rounded-lg block min-w-0 grow bg-gray-800 py-1.5 pr-3 pl-1 text-base  placeholder:text-gray-500 focus:outline-none sm:text-sm/6" />
        </div>
      </div> -->
        <div class="relative z-0 w-50  mb-5 group">
            <input type="tag" name="floating_tag" id="floating_tag" 
                @keydown.tab="onTab"
                
                class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer" 
                placeholder="" required 
                v-model="note.tags"
                />
            <label for="floating_tag" class="peer-focus:font-medium absolute text-md text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-red-600 peer-focus:dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Tag
            </label>
        </div>
      <!-- <div>
        <label for="price" class="block text-sm/6 font-medium ">Tag</label>
        <div class="mt-2">
            <input id="price" type="text" name="price" placeholder="" 
            class="w-50 rounded-lg block min-w-0 grow bg-gray-800 py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6" />
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>

</style>
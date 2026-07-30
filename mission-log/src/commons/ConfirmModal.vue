<script setup lang="ts">
import ButtonLoading from './ButtonLoading.vue'
import CustomModal from './ModalBase.vue';

import { useShowModal } from '@/composables/useShowModals.ts';

interface Props {
  title?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(),{
  title: 'Are you sure you want to proceed?',
  show: false,
  loading:false
})

const emits = defineEmits<{
  confirm: []
  close: []
}>()

const show = defineModel({ default: false })
const { modal, hideModal } = useShowModal("modal", show);


const confirm = () => {
  emits('confirm')
}

</script>

<template>
  <CustomModal 
    v-model="modal"
    maxWidth="sm"      
    >
    <div class="py-4 px-6">
      <h2 class="text-lg font-medium dark:text-gray-100" v-if="title">{{ title }}</h2>                  
      <slot>
      </slot>

      <div class="mt-6 flex justify-center gap-3">
        <button class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-25 transition ease-in-out duration-150"
          @click="hideModal"
        >
          Close
        </button>

        <ButtonLoading class="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"            
          type="button"
          @click="confirm"
          :loading="loading"
        >
          Confirm
        </ButtonLoading>          
      </div>
    </div>
  </CustomModal>
</template>
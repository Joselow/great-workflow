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
      <h2 class="text-center text-lg text-gray-800 font-semibold dark:text-gray-100" v-if="title">{{ title }}</h2>
      <slot>
      </slot>

      <div class="mt-6 flex justify-center gap-3">
        <button class="cursor-pointer text-white inline-flex items-center px-4 py-2 rounded-md border-2 border-gray-300 dark:border-white/15 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 bg-gray-700 hover:bg-gray-600 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-25"
          @click="hideModal"
        >
          Cancelar
        </button>

        <ButtonLoading class="cursor-pointer inline-flex items-center px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wide text-white bg-red-500 hover:bg-red-400 active:bg-brand-pink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-pink/40 disabled:opacity-25"
          type="button"
          @click="confirm"
          :loading="loading"
        >
          Confirmar
        </ButtonLoading>
      </div>
    </div>
  </CustomModal>
</template>
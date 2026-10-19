<script setup lang="ts">
import type { RequirementDraft } from '@/interfaces/requirement'

const draft = defineModel<RequirementDraft>({ required: true })

const props = withDefaults(defineProps<{
  saving?: boolean
}>(), {
  saving: false,
})

const emit = defineEmits<{
  save: []
}>()

const onSubmit = () => {
  if (props.saving) return
  emit('save')
}

const clearForm = () => {
  draft.value = { id: undefined, name: '' }
}
</script>

<template>
  <form
    class="rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/15 dark:bg-white/5"
    @submit.prevent="onSubmit"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-center">
      <input
        v-model="draft.name"
        type="text"
        placeholder="Nombre del requerimiento"
        class="w-full sm:w-5/6 rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
      />
      <button
        v-if="draft.id"
        @click="clearForm"
        type="submit"
        class="w-full sm:w-1/6 cursor-pointer rounded-lg bg-rose-400 py-2 text-xs font-semibold text-white 
        disabled:cursor-not-allowed 
        disabled:opacity-60
        hover:bg-rose-300"
        :disabled="saving"
      >
        <span class="material-symbols-outlined align-middle"
          style="font-size: 18px;"
        >cancel</span>
        Cancelar
      </button>
      <button
        type="submit"
        class="w-full sm:w-1/6 cursor-pointer rounded-lg bg-brand-orange px-4 py-2 text-xs font-semibold text-white 
        disabled:cursor-not-allowed 
        disabled:opacity-60
        hover:bg-orange-400"
        :disabled="saving"
      >
        <span class="material-symbols-outlined align-middle"
          style="font-size: 18px;"
        >save</span>
        <!-- Guardar -->
         {{ draft.id ? 'Guardar' : 'Crear' }}
      </button>
    </div>
  </form>
</template>

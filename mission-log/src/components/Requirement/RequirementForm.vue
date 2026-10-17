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
</script>

<template>
  <form
    class="rounded-xl border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-white/5"
    @submit.prevent="onSubmit"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-center">
      <input
        v-model="draft.name"
        type="text"
        placeholder="Nombre del requerimiento"
        class="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
      />
      <button
        type="submit"
        class="cursor-pointer rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="saving"
      >
        <span class="material-symbols-outlined align-middle text-[18px]">save</span>
        Guardar
      </button>
    </div>
  </form>
</template>

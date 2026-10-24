<script setup lang="ts">
import { ref } from 'vue';

import ActionTemplateMenu from '@/components/ActionTemplate/ActionTemplateMenu.vue'
import ButtonTone from '@/commons/ButtonTone.vue'

import { taskEntityContent } from '@/helpers/taskContent'
import type { ActionTemplate } from '@/interfaces/actionTemplate'
import type { Task } from '@/interfaces/task'
import { textDataStore } from '@/store/textDataStore';

withDefaults(defineProps<{
  task: Task
  completing: boolean
  templates?: ActionTemplate[]
}>(), {
  templates: () => [],
})

const emit = defineEmits<{
  complete: []
  edit: []
  delete: []
}>()


const showDescription = ref(false)

const handleViewDescription = (task: Task) => {
  if (!task.description.trim()) {
    textDataStore.setTextData('', 'markdown')
    return
  }

  textDataStore.setTextData(taskEntityContent(task), 'markdown')
}

</script>

<template>
  <tr class="border-b border-black/5 last:border-b-0 dark:border-white/5">
    <td class="px-3 py-0">
      <p
        class="break-words font-semibold text-gray-900 dark:text-white"s
      >
        {{ task.name }}
      </p>
      <p
        v-if="showDescription && task.description"
        class="mt-1 whitespace-pre-wrap break-words text-sm text-gray-500 dark:text-gray-400"
      >
        {{ task.description }}
      </p>
    </td>

    <td class="px-3 py-3 align-top">
      <ButtonTone
        class="w-full text-center"
        :success="task.completed"
        :loading="completing"
        @click="emit('complete')"
      >
        <template #success>
          <span class="material-symbols-outlined text-[18px]">check_circle</span>
          Completada
        </template>
        <template #pending>
          <span class="material-symbols-outlined text-[18px]">radio_button_unchecked</span>
          Pendiente
        </template>
      </ButtonTone>
    </td>

    <td class="px-3 py-3 align-top">
      <div class="flex items-center justify-end gap-2">
        
        <button
          v-if="task.description"
          type="button"
          title="Ver descripción"
          aria-label="Ver descripción"
          class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-black/10 px-2 py-1 
          text-gray-600 dark:border-white/15 dark:text-gray-200

          hover:bg-gray-100 dark:hover:bg-gray-900
          focus:bg-cyan-100 dark:focus:bg-cyan-900/80          "
          @click="handleViewDescription(task)"
        >
          <span class="material-symbols-outlined"
            style="font-size: 19px;"
          >menu_open</span>
        </button>


        <button
          v-if="task.description"
          type="button"
          title="Ver descripción"
          aria-label="Ver descripción"
          class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-black/10 px-2 py-1 text-gray-600 dark:border-white/15 dark:text-gray-200"
          :class="{ 'bg-green-100 dark:bg-green-900': showDescription }"

          @click="showDescription = !showDescription"
        >
          <span class="material-symbols-outlined"
            style="font-size: 19px;"
          >article</span>
        </button>
        <ActionTemplateMenu
          :templates="templates"
          :entity="taskEntityContent(task)"
        />

        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-black/10 px-2 py-1 text-gray-600 dark:border-white/15 dark:text-gray-200"
          title="Editar"
          aria-label="Editar"
          @click="emit('edit')"
        >
          <span class="material-symbols-outlined"
            style="font-size: 19px;"
          >edit</span>
        </button>

        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-rose-500/40 px-2 py-1 text-rose-600 dark:text-rose-300"
          title="Eliminar"
          aria-label="Eliminar"
          @click="emit('delete')"
        >
          <span class="material-symbols-outlined"
            style="font-size: 19px;"
          >delete</span>
        </button>
      </div>
    </td>
  </tr>
</template>

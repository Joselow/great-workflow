<script setup lang="ts">
import { onMounted, ref } from 'vue'

import ActionTemplateFormModal from '@/components/ActionTemplate/ActionTemplateFormModal.vue'
import ActionTemplateSection from '@/components/ActionTemplate/ActionTemplateSection.vue'
import CommonLoader from '@/commons/CommonLoader.vue'
import ConfirmModal from '@/commons/ConfirmModal.vue'

import { useActionTemplate } from '@/composables/useActionTemplate'
import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'

import type {
  ActionTemplate,
  ActionTemplateDraft,
  ActionTemplateModule,
  ActionTemplateWritePayload,
} from '@/interfaces/actionTemplate'

const sections: { module: ActionTemplateModule; title: string; icon: string }[] = [
  { module: 'all', title: 'Todos los módulos', icon: 'grid_view' },
  { module: 'log', title: 'Logs', icon: 'edit_note' },
  { module: 'meeting', title: 'Reuniones', icon: 'co_present' },
  { module: 'requirement', title: 'Requerimientos', icon: 'assignment' },
  { module: 'task', title: 'Tareas', icon: 'task_alt' },
]

const { loading, templates, getActionTemplates, createActionTemplate, updateActionTemplate, deleteActionTemplate } = useActionTemplate()

const emptyDraft = (module: ActionTemplateModule): ActionTemplateDraft => ({
  module,
  name: '',
  action: '',
  template: '',
  color: DEFAULT_PROJECT_COLOR,
  isActive: true,
  contentMode: 'text',
  card: null,
})

const formOpen = ref(false)
const draft = ref<ActionTemplateDraft>(emptyDraft('all'))
const confirmOpen = ref(false)
const pendingDelete = ref<ActionTemplate | null>(null)

const templatesFor = (module: ActionTemplateModule) =>
  templates.value.filter((template) => template.module === module)

const toPayload = (value: ActionTemplateDraft): ActionTemplateWritePayload => ({
  module: value.module,
  name: value.name.trim(),
  action: value.action.trim() ? value.action.trim() : null,
  template: value.contentMode === 'text' ? value.template.trim() : '',
  color: value.color,
  isActive: value.isActive,
  cardId: value.contentMode === 'card' ? value.card?.id ?? null : null,
})

const onAdd = (module: ActionTemplateModule) => {
  draft.value = emptyDraft(module)
  formOpen.value = true
}

const onEdit = (template: ActionTemplate) => {
  draft.value = {
    id: template.id,
    module: template.module,
    name: template.name,
    action: template.action ?? '',
    template: template.template,
    color: template.color,
    isActive: template.isActive,
    contentMode: template.card ? 'card' : 'text',
    card: template.card,
  }
  formOpen.value = true
}

const onSave = async () => {
  const current = draft.value
  if (current.contentMode === 'card' && !current.card) return

  const payload = toPayload(current)
  const result = current.id
    ? await updateActionTemplate(current.id, payload)
    : await createActionTemplate(payload)

  if (!result.success) return

  formOpen.value = false
  await getActionTemplates()
}

const askDelete = (template: ActionTemplate) => {
  pendingDelete.value = template
  confirmOpen.value = true
}

const confirmDelete = async () => {
  const template = pendingDelete.value
  confirmOpen.value = false
  pendingDelete.value = null
  if (!template) return

  const result = await deleteActionTemplate(template.id)
  if (!result.success) return
  await getActionTemplates()
}

onMounted(() => {
  void getActionTemplates()
})
</script>

<template>
  <div class="mx-auto w-full min-w-0 max-w-5xl overflow-x-hidden">
    <CommonLoader v-if="loading" />

    <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Template Actions</h1>

    <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ActionTemplateSection
        v-for="section in sections"
        :key="section.module"
        :class="section.module === 'all' ? 'lg:col-span-2' : ''"
        :title="section.title"
        :icon="section.icon"
        :templates="templatesFor(section.module)"
        @add="onAdd(section.module)"
        @edit="onEdit"
        @delete="askDelete"
      />
    </div>

    <ActionTemplateFormModal
      v-model="formOpen"
      v-model:draft="draft"
      :saving="loading"
      @save="onSave"
    />

    <ConfirmModal
      v-model="confirmOpen"
      title="Eliminar esta acción"
      @confirm="confirmDelete"
    >
      <p class="mt-3 text-center text-sm text-gray-600 dark:text-gray-300">
        Se elimina solo esta acción. La card vinculada no se borra.
      </p>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import ActionTemplateFormModal from '@/components/ActionTemplate/ActionTemplateFormModal.vue'
import ActionTemplateSection from '@/components/ActionTemplate/ActionTemplateSection.vue'
import AssociateCardModal from '@/components/Card/AssociateCardModal.vue'
import CommonLoader from '@/commons/CommonLoader.vue'
import ConfirmModal from '@/commons/ConfirmModal.vue'

import { useActionTemplate } from '@/composables/useActionTemplate'
import { useCard } from '@/composables/useCard'
import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'
import { debounce } from '@/utils/debounce'

import type { CardListItem } from '@/interfaces/card'
import type {
  ActionTemplate,
  ActionTemplateDraft,
  ActionTemplateModule,
  ActionTemplateWritePayload,
} from '@/interfaces/actionTemplate'

const PAGE_SIZE = 12

const sections: { module: ActionTemplateModule; title: string }[] = [
  { module: 'all', title: 'Todos' },
  { module: 'log', title: 'Logs' },
  { module: 'meeting', title: 'Reuniones' },
  { module: 'requirement', title: 'Requerimientos' },
  { module: 'task', title: 'Tareas' },
]

const router = useRouter()
const { loading, templates, getActionTemplates, createActionTemplate, updateActionTemplate, deleteActionTemplate } = useActionTemplate()
const { loading: cardsLoading, getCards } = useCard()

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

const associateOpen = ref(false)
const associateQuery = ref('')
const associatePage = ref(1)
const associateItems = ref<CardListItem[]>([])
const associateTotal = ref(0)

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

const loadAssociateCards = async () => {
  const result = await getCards({
    isPrompt: true,
    q: associateQuery.value.trim() || undefined,
    page: associatePage.value,
    limit: PAGE_SIZE,
  })

  if (!result.success || !result.data) {
    associateItems.value = []
    associateTotal.value = 0
    return
  }

  associateItems.value = result.data.items
  associateTotal.value = result.data.total
}

const loadAssociateDebounced = debounce(() => {
  void loadAssociateCards()
}, 300)

watch(associateOpen, (open) => {
  if (!open) return
  associateQuery.value = ''
  associatePage.value = 1
  void loadAssociateCards()
})

const onAssociateSearch = (query: string) => {
  associateQuery.value = query
  associatePage.value = 1
  loadAssociateDebounced()
}

const onAssociatePage = (page: number) => {
  associatePage.value = page
  void loadAssociateCards()
}

const onSelectCard = (card: CardListItem) => {
  draft.value = {
    ...draft.value,
    contentMode: 'card',
    card: {
      id: card.id,
      name: card.name,
      color: card.color,
      description: card.description,
    },
  }
}

const onEditCard = (id: string) => {
  void router.push({ name: 'editCard', params: { id } })
}

onMounted(() => {
  void getActionTemplates()
})
</script>

<template>
  <div class="mx-auto w-full min-w-0 max-w-5xl overflow-x-hidden">
    <CommonLoader v-if="loading" />

    <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Action Templates</h1>

    <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ActionTemplateSection
        v-for="section in sections"
        :key="section.module"
        :class="section.module === 'all' ? 'lg:col-span-2' : ''"
        :title="section.title"
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
      @associate="associateOpen = true"
      @edit-card="onEditCard"
    />

    <AssociateCardModal
      v-model="associateOpen"
      :items="associateItems"
      :loading="cardsLoading"
      :page="associatePage"
      :total="associateTotal"
      :page-size="PAGE_SIZE"
      @search="onAssociateSearch"
      @page="onAssociatePage"
      @select="onSelectCard"
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

<script setup lang="ts">
import ActionTemplateButton from '@/components/ActionTemplate/ActionTemplateButton.vue'
import MeetingRowActions from '@/components/Meeting/MeetingRowActions.vue'
import { applyActionTemplate } from '@/helpers/applyActionTemplate'

import type { ActionTemplate } from '@/interfaces/actionTemplate'

defineProps<{
  templates: ActionTemplate[]
  entity: string
}>()
</script>

<template>
  <MeetingRowActions v-if="templates.length">
    <ActionTemplateButton
      v-for="template in templates"
      :key="template.id"
      :template="template"
      @click="applyActionTemplate(template, entity)"
    />
  </MeetingRowActions>
</template>

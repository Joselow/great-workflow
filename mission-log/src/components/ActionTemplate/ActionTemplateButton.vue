<script setup lang="ts">
import { computed } from 'vue'

import { actionTitle } from '@/helpers/actionTemplateText'
import { isLightHex } from '@/helpers/cardColor'

import type { ActionTemplate } from '@/interfaces/actionTemplate'

const props = defineProps<{
  template: ActionTemplate
  block?: boolean
}>()

const labelColor = computed(() => (isLightHex(props.template.color) ? '#18181b' : '#ffffff'))
</script>

<template>
  <button
    type="button"
    class="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-left text-xs font-semibold break-words"
    :class="block ? 'mt-2 w-full justify-center' : 'w-full'"
    :style="{ backgroundColor: template.color, color: labelColor }"
    :title="actionTitle(template)"
    :role="block ? undefined : 'menuitem'"
  >
    <span class="material-symbols-outlined shrink-0" style="font-size: 1rem;">touch_app</span>
    <span class="min-w-0">{{ template.name }}</span>
  </button>
</template>

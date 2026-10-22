<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

import { markersToHtml } from '@/helpers/richText'
import type { Meeting } from '@/interfaces/meeting'
import { formatDateText } from '@/utils/date'

const props = defineProps<{
  meeting: Meeting
}>()

const meetingTime = computed(() => dayjs(props.meeting.date).format('h:mm A'))
const fieldHtml = (value: string) => markersToHtml(value, true)
</script>

<template>
  <section class="mx-auto flex w-full max-w-3xl flex-1 flex-col rounded-2xl border border-black/10 p-6 md:p-8 dark:border-white/15">
    <div class="flex items-start justify-between gap-6">
      <h2 class="min-w-0 text-2xl font-semibold">
        <span class="material-symbols-outlined mr-1 align-middle">co_present</span>
        {{ meeting.title }}
      </h2>
      <p class="shrink-0 text-right text-sm text-gray-500 dark:text-gray-400">
        <span class="text-gray-700 dark:text-gray-200">{{ formatDateText(meeting.date) }}</span>
        <span> · {{ meetingTime }} · ~{{ meeting.estimatedDuration }} min</span>
      </p>
    </div>

    <div class="mt-10 space-y-8">
      <div>
        <p class="text-md font-semibold">Estado</p>
        <div class="mt-2 text-sm leading-relaxed" v-html="fieldHtml(meeting.topicStatus)" />
      </div>

      <div>
        <p class="text-md font-semibold">Agenda</p>
        <ul v-if="meeting.issues.length" class="mt-2 list-inside list-disc space-y-2 text-sm leading-4">
          <li
            v-for="issue in meeting.issues"
            :key="issue.id ?? issue.name"
            v-html="fieldHtml(issue.name)"
          />
        </ul>
      </div>
    </div>

    <div class="mt-10">
      <p class="text-md font-semibold">Objetivo</p>
      <div
        class="mt-3 rounded-xl border border-green-600/40 px-4 py-5 text-sm leading-relaxed text-green-700 dark:border-green-400/40 dark:text-green-500"
        v-html="fieldHtml(meeting.objective)"
      />
    </div>

    <div class="mt-auto flex flex-col gap-3 pt-12 sm:flex-row sm:items-center sm:gap-6">
      <p class="shrink-0 text-sm font-semibold sm:w-36">Participantes Reunión</p>
      <div class="min-w-0 flex-1 whitespace-pre-wrap rounded-xl border border-orange-500/50 px-4 py-3 
      text-center text-sm text-orange-600 dark:border-orange-400/60 dark:text-orange-400">
        {{ meeting.participants }}
      </div>
    </div>
  </section>
</template>

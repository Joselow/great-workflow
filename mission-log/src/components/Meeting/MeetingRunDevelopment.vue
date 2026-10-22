<script setup lang="ts">
import MeetingRunIssue from '@/components/Meeting/MeetingRunIssue.vue'
import MeetingRunNotebook from '@/components/Meeting/MeetingRunNotebook.vue'
import type { Meeting, MeetingIssue } from '@/interfaces/meeting'

defineProps<{
  meeting: Meeting
}>()

const openIssue = defineModel<MeetingIssue | null>('openIssue', { required: true })
const additionalInfo = defineModel<string>('additionalInfo', { required: true })

const emit = defineEmits<{
  commit: []
}>()
</script>

<template>
  <section class="mx-auto w-full max-w-3xl space-y-5">
    <h2 class="text-lg font-semibold tracking-wide">
      <span class="material-symbols-outlined align-middle">view_object_track</span>
      Puntos por desarrollar</h2>

    <template v-if="openIssue">
      <button
        type="button"
        class="cursor-pointer text-xs font-semibold text-sky-700 dark:text-sky-300"
        @click="openIssue = null"
      >
        <span class="material-symbols-outlined align-middle" style="font-size: 1rem;">arrow_back</span>
        Volver a la agenda
      </button>
      <MeetingRunIssue :issue="openIssue" />
      <MeetingRunNotebook
        :meeting-id="meeting.id"
        :project-id="meeting.projectId"
      />
      <label class="block text-sm font-semibold">
        Detalles adicionales
        <textarea
          v-model="additionalInfo"
          rows="3"
          class="mt-1 w-full rounded-md border border-black/10 bg-white/70 px-2 py-1.5 text-sm outline-none dark:border-white/15 dark:bg-white/5"
          @blur="emit('commit')"
        />
      </label>
    </template>

    <template v-else>
      <p v-if="!meeting.issues.length" class="text-sm text-gray-500">
        La agenda no tiene temas.
      </p>
      <ul v-else class="mt-8 space-y-4">
        <li v-for="issue in meeting.issues" :key="issue.id ?? issue.name">
          <MeetingRunIssue
            :issue="issue"
            interactive
            @open="openIssue = issue"
          />
        </li>
      </ul>
    </template>
  </section>
</template>

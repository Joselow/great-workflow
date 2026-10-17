<script setup lang="ts">
import { nextTick, onMounted, onUpdated, ref, watch } from 'vue'

import { htmlToMarkers, markersToHtml, normalizeMarkers } from '@/helpers/richText'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  multiline?: boolean
  maxlength?: number
  placeholder?: string
  rows?: number
}>(), {
  multiline: false,
  placeholder: '',
  rows: 2,
})

const emit = defineEmits<{
  enter: []
}>()

const editor = ref<HTMLDivElement | null>(null)
let writing = false
let painting = false

const renderedHtml = (value: string) => markersToHtml(value, props.multiline)

const paint = () => {
  const field = editor.value
  if (!field || writing) return

  const normalized = normalizeMarkers(model.value ?? '')
  if (normalized !== (model.value ?? '')) {
    writing = true
    model.value = normalized
    void nextTick(() => {
      writing = false
    })
  }

  const html = renderedHtml(normalized)
  if (field.innerHTML === html) return

  painting = true
  field.innerHTML = html
  queueMicrotask(() => {
    painting = false
  })
}

onMounted(paint)

watch(() => model.value, () => {
  if (writing) return
  paint()
}, { flush: 'post' })

onUpdated(() => {
  const field = editor.value
  if (!field || writing || document.activeElement === field) return
  paint()
})

const onBlur = () => {
  publish()
  void nextTick(() => {
    paint()
  })
}

const publish = () => {
  const field = editor.value
  if (!field || painting) return

  const next = htmlToMarkers(field, props.multiline)
  if (props.maxlength && next.length > props.maxlength) {
    paint()
    return
  }

  if (next === model.value) return

  writing = true
  model.value = next
  void nextTick(() => {
    writing = false
  })
}

const formatSelection = (tag: 'strong' | 'em') => {
  const field = editor.value
  const selection = window.getSelection()
  if (!field || !selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  if (!field.contains(range.commonAncestorContainer)) return

  const host = range.commonAncestorContainer instanceof HTMLElement
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement
  const current = host?.closest(tag)

  if (current && field.contains(current)) {
    const text = document.createTextNode(current.textContent ?? '')
    current.replaceWith(text)
    const next = document.createRange()
    next.selectNodeContents(text)
    selection.removeAllRanges()
    selection.addRange(next)
    return
  }

  if (range.collapsed) {
    document.execCommand('styleWithCSS', false, 'false')
    document.execCommand(tag === 'strong' ? 'bold' : 'italic')
    return
  }

  const wrapper = document.createElement(tag)
  wrapper.appendChild(range.extractContents())
  range.insertNode(wrapper)
  const next = document.createRange()
  next.selectNodeContents(wrapper)
  selection.removeAllRanges()
  selection.addRange(next)
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
    const key = event.key.toLowerCase()
    if (key === 'b' || key === 'i') {
      event.preventDefault()
      formatSelection(key === 'b' ? 'strong' : 'em')
      publish()
      return
    }
  }

  if (!props.multiline && event.key === 'Enter') {
    event.preventDefault()
    emit('enter')
  }
}

const onPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') ?? ''
  const clean = props.multiline ? text : text.replace(/[^\S\n]*\n[^\S\n]*/g, ' ')
  if (!clean) return

  document.execCommand('insertText', false, clean)
  publish()
}

defineExpose({
  focus: () => editor.value?.focus(),
})
</script>

<template>
  <div
    ref="editor"
    class="editor w-full rounded-md border border-black/10 bg-white/70 px-2 text-sm font-normal not-italic text-gray-800 outline-none dark:border-white/15 dark:bg-white/5 dark:text-gray-100"
    :class="[
      multiline ? 'whitespace-pre-wrap py-1.5 break-words' : 'py-1',
      { 'is-empty': !model },
    ]"
    :style="multiline ? { minHeight: `${rows * 1.4}rem` } : undefined"
    contenteditable="true"
    role="textbox"
    :aria-multiline="multiline"
    :data-placeholder="placeholder"
    spellcheck="true"
    @keydown="onKeydown"
    @input="publish"
    @paste="onPaste"
    @blur="onBlur"
  />
</template>

<style scoped>
.editor:deep(strong),
.editor:deep(b) {
  font-weight: 800;
}

.editor:deep(em),
.editor:deep(i) {
  font-style: italic;
  font-weight: inherit;
}

.editor.is-empty::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}
</style>

import { ref } from 'vue'

import router from '@/router'
import { projectStore } from '@/store/projectStore'
import { textDataStore } from '@/store/textDataStore'
import { logStore } from '@/store/logStore'
import { useProject } from '@/composables/useProject'

export type KeyboardCommandGroup = 'navigate' | 'panels' | 'logs' | 'help'

export interface KeyboardCommand {
  id: string
  group: KeyboardCommandGroup
  label: string
  icon: string
  scopeLabel?: string
  keys: string[]
  match: (event: KeyboardEvent) => boolean
  when?: () => boolean
  run: () => void
}

const { drawerOpen, closeDrawer } = projectStore
const { toggleExpanded } = textDataStore
const { selectedLog } = logStore
const { showProjectsDrawer } = useProject()

const helpOpen = ref(false)

const openHelp = () => {
  helpOpen.value = true  
}

const closeHelp = () => {
  helpOpen.value = false
}

const toggleHelp = () => {
  helpOpen.value = !helpOpen.value
}

let clearSelectedLog: (() => void) | null = null

const setClearSelectedLog = (action: (() => void) | null) => {
  clearSelectedLog = action
}

const isShiftLetter = (event: KeyboardEvent, letter: string) =>
  event.shiftKey && event.key.toLowerCase() === letter

const isHelpShortcut = (event: KeyboardEvent) =>
  event.shiftKey && event.key === '/'

const commands: KeyboardCommand[] = [
  {
    id: 'go-logs',
    group: 'navigate',
    label: 'Ir a Logs',
    icon: 'edit_note',
    keys: ['Mayús', 'L'],
    match: (event) => isShiftLetter(event, 'l'),
    run: () => {
      router.push({ name: 'logger' })
    },
  },
  {
    id: 'go-cards',
    group: 'navigate',
    label: 'Ir a Cards',
    icon: 'cards_stack',
    keys: ['Mayús', 'C'],
    match: (event) => isShiftLetter(event, 'c'),
    run: () => {
      router.push({ name: 'cards' })
    },
  },
  {
    id: 'go-meetings',
    group: 'navigate',
    label: 'Ir a Meetings / Reuniones',
    icon: 'co_present',
    keys: ['Mayús', 'M'],
    match: (event) => isShiftLetter(event, 'm'),
    run: () => {
      router.push({ name: 'meetings' })
    },
  },
  
  {
    id: 'toggle-projects',
    group: 'panels',
    label: 'Abrir o cerrar proyectos',
    icon: 'folder_open',
    keys: ['Mayús', 'P'],
    match: (event) => isShiftLetter(event, 'p'),
    run: () => {
      if (drawerOpen.value) {
        closeDrawer()
        return
      }

      showProjectsDrawer(router.currentRoute.value.path)
    },
  },
  {
    id: 'toggle-writer',
    group: 'panels',
    label: 'Abrir o cerrar Writer',
    icon: 'ink_pen',
    keys: ['Mayús', 'W'],
    match: (event) => isShiftLetter(event, 'w'),
    run: () => {
      toggleExpanded()
    },
  },
  {
    id: 'clear-log',
    group: 'logs',
    label: 'Quitar el log seleccionado',
    icon: 'restart_alt',
    scopeLabel: 'En Logs',
    keys: ['+'],
    match: (event) => event.key === '+',
    when: () => clearSelectedLog !== null && Boolean(selectedLog.value?.id),
    run: () => {
      clearSelectedLog?.()
    },
  },
  {
    id: 'toggle-help',
    group: 'help',
    label: 'Abrir o cerrar esta ayuda',
    icon: 'keyboard',
    keys: ['Mayús', '/'],
    match: isHelpShortcut,
    run: toggleHelp,
  },
  {
    id: 'go-requirements',
    group: 'navigate',
    label: 'Ir a Requerimientos',
    icon: 'assignment',
    keys: ['Mayús', 'R'],
    match: (event) => isShiftLetter(event, 'r'),
    run: () => {
      router.push({ name: 'requirements' })
    },
  },
  {
    id: 'go-tasks',
    group: 'navigate',
    label: 'Ir a Tareas',
    icon: 'task_alt',
    keys: ['Mayús', 'T'],
    match: (event) => isShiftLetter(event, 't'),
    run: () => {
      router.push({ name: 'tasks' })
    },
  },
]

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false

  const tag = target.tagName

  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!router.currentRoute.value.meta.requiresAuth) return
  if (isTypingTarget(event.target)) return
  if (event.ctrlKey || event.altKey || event.metaKey) return
  if (helpOpen.value && !isHelpShortcut(event)) return

  const command = commands.find((item) => item.match(event) && (item.when?.() ?? true))
  if (!command) return

  event.preventDefault()
  command.run()
}

export const keyboardCommands = {
  commands,
  helpOpen,
  openHelp,
  closeHelp,
  toggleHelp,
  handleKeydown,
  setClearSelectedLog,
}

import { ref } from 'vue'

import { toSnapshot } from '@/helpers/snapshotProject'

import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'

import type { ActiveProject, PartialProject, Project } from '@/interfaces/project'


const startProject = {
  id: null, 
  name: '',
  description: '',
  color: DEFAULT_PROJECT_COLOR,
}

const draftProject = ref<PartialProject | null>(null)
const projects = ref<Project[]>([])

const activeProject = ref<ActiveProject | null>(null)

const renderProjectDrawer = ref(false)
const drawerOpen = ref(false)
const formMode = ref<'create' | 'edit' | null>(null)
const returnPath = ref<string | null>(null)

const lastPersistedDraft = ref<PartialProject>(startProject)

const setActiveProject = (project: ActiveProject) => {
  activeProject.value = {...project}
}

const openDrawer = (path?: string) => {
  renderProjectDrawer.value = true
  
  returnPath.value = path ?? null
  drawerOpen.value = true
}

const closeDrawer = () => {
  drawerOpen.value = false
}

const finishProjectSelection = () => {
  closeDrawer()
  draftProject.value = null
  formMode.value = null
  lastPersistedDraft.value = startProject

  const path = returnPath.value ?? '/'
  returnPath.value = null
  return path
}


const startNewDraft = (): PartialProject => {
  formMode.value = 'create'
  lastPersistedDraft.value = {...startProject}
  draftProject.value = {...startProject} 
  return draftProject.value
}

const editDraft = (project: Project) => {
  formMode.value = 'edit'

  const snapshot = toSnapshot(project)
  draftProject.value = snapshot
  lastPersistedDraft.value = {...snapshot}

  console.log('lastPersistedDraft', lastPersistedDraft.value);
}



export const useProjectStore = () => ({
  projects,
  activeProject,
  drawerOpen,
  formMode,
  draftProject,
  returnPath,
  lastPersistedDraft,
  setActiveProject,
  openDrawer,
  closeDrawer,
  finishProjectSelection,
  startNewDraft,
  editDraft,
  renderProjectDrawer,
})

export const projectStore = useProjectStore()

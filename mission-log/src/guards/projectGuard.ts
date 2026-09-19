import type { NavigationGuard } from 'vue-router'

import { useProject } from '@/composables/useProject'
import { useProjectSelected } from '@/composables/useProjectSelected'
import { projectStore } from '@/store/projectStore'

const { getStoredActiveProject } = useProjectSelected()
const { showProjectsDrawer } = useProject()

export const projectGuard: NavigationGuard = (to) => {
  if (!to.meta.requiresAuth) return true

  if (!projectStore.activeProject.value) {
    const storedProject = getStoredActiveProject()

    if (storedProject) {
      projectStore.setActiveProject(storedProject)
      return true
    }

    showProjectsDrawer(to.path)
  }

  return true
}

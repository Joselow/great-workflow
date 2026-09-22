import type { StoredActiveProject, ActiveProject } from "@/interfaces/project"
import { authStore } from "@/store/authStore"
import { projectStore } from "@/store/projectStore"
import { clearStoredData, getStoredData, setStoredData } from "@/utils/activeProjectStorage"

const STORAGE_KEY = 'fwl:activeProject'

const { setActiveProject } = projectStore

export function useProjectSelected() {
  const getStoredActiveProject = (): ActiveProject | null => {
    const user = authStore.getUser()
    if (!user) return null

    const raw = getStoredData(STORAGE_KEY)

    if (!raw) return null

    try {
      const parsed = JSON.parse(raw) as StoredActiveProject

      if (parsed.userId === user.id && parsed.id &&
          parsed.name && parsed.color) {
        return {
          id: parsed.id,
          name: parsed.name,
          color: parsed.color,
        }
      }

      return null
    } catch {
      return null
    }
  }

  const setStoredActiveProject = (project: ActiveProject): void => {
    const user = authStore.getUser()
    if (!user) return

    const payload: StoredActiveProject = {
      ...project,
      userId: user.id,
    }

    setStoredData(STORAGE_KEY, JSON.stringify(payload))
    setActiveProject(project)
  }

  const clearStoredActiveProject = (): void => {
    clearStoredData(STORAGE_KEY)
    setActiveProject(null)
  }

  return {
    getStoredActiveProject,
    setStoredActiveProject,
    clearStoredActiveProject,
  }
}

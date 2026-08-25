import type { ActiveProject } from "@/interfaces/project"
import { projectStore } from "@/store/projectStore"
import { clearStoredData, getStoredData, setStoredData } from "@/utils/activeProjectStorage"

const STORAGE_KEY = 'fwl:activeProject'


const { setActiveProject } = projectStore

export function useProjectSelected() {
  const getStoredActiveProject = (): ActiveProject | null => {
    const raw = getStoredData(STORAGE_KEY)

    if (!raw) return null

    try {
      const parsed = JSON.parse(raw) as ActiveProject

      if (parsed.id && parsed.name && parsed.color) {
        return parsed
      }

      return null
    } catch {
      return null
    }
  }

  const setStoredActiveProject = (project: ActiveProject): void => {
    setStoredData(STORAGE_KEY, JSON.stringify(project))
    setActiveProject(project)
  }

  const clearStoredActiveProject = (): void => {
    clearStoredData(STORAGE_KEY)
  }

  return {
    getStoredActiveProject,
    setStoredActiveProject,
    clearStoredActiveProject,
  }
}

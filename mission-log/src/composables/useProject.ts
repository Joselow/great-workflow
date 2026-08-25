import { ref } from 'vue'
import apiApp from '@/utils/axios/apiApp'

import { projectStore } from '@/store/projectStore'

import type { Project, NewProject, PartialProject } from '@/interfaces/project'
import type { ResponseComposables } from '@/interfaces/request'
import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'
import { snapshotsEqual, toSnapshot } from '@/helpers/snapshotProject'
import { updateFromArray } from '@/utils/array'

const { projects, openDrawer, lastPersistedDraft, draftProject } = projectStore




export function useProject() {
  const loading = ref(false)

  const getProjects = async (): Promise<ResponseComposables<Project[]>> => {
    loading.value = true

    try {
      const { data } = await apiApp.get('/project')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const getProjectById = async (id: string): Promise<ResponseComposables<Project>> => {
    loading.value = true
    try {
      const { data } = await apiApp.get(`/project/${id}`)
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const createProject = async (project: NewProject): Promise<ResponseComposables<Project>> => {
    loading.value = true

    try {
      const { data } = await apiApp.post('/project', project)
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (
    id: string,
    project: PartialProject
  ): Promise<ResponseComposables<Project>> => {
    loading.value = true

    try {
      const { data } = await apiApp.put(`/project/${id}`, project)
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const showProjectsDrawer = async (routePath: string) => {
    openDrawer(routePath)
    
    if (projects.value.length) {
      return
    }

    const { success, data } = await getProjects()

    if (success && data) {
      projects.value = data
    }
  }

  const saveDraft = async (draft: PartialProject) => {
    
    const snapshot = toSnapshot(draft)

    console.log('snapshot', snapshot);
    console.log('lastPersistedDraft', lastPersistedDraft.value);
    
    if (lastPersistedDraft.value && snapshotsEqual(lastPersistedDraft.value, snapshot)) {
      return
    }

    if (draftProject.value?.id) {
      const { success, data } = await updateProject(draftProject.value.id, snapshot)

      if (success && data) {
          projects.value = updateFromArray(projects.value, data as Project)
          lastPersistedDraft.value = snapshot
        }

    } else {
      const payload = {
        name: snapshot.name as string,
        description: snapshot.description || null,
        color: snapshot.color,
      } 
    
      const { success, data } = await createProject(payload)
  
      if (success && data) {
        // projects.value.unshift(data)
        draftProject.value!.id = data.id
  
        lastPersistedDraft.value = toSnapshot(draftProject.value as PartialProject)
      }
    }
  
  }

  return {
    loading,
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    showProjectsDrawer,
    saveDraft,
  }
}

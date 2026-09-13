import { ref } from 'vue'
import apiApp from '@/utils/axios/apiApp'

import { projectStore } from '@/store/projectStore'

import { useProjectSelected } from '@/composables/useProjectSelected'

import { snapshotsEqual, toSnapshot } from '@/helpers/snapshotProject'
import { deleteFromArray, updateFromArray } from '@/utils/array'
import { successToast } from '@/composables/useAlerts'

import type { ResponseComposables } from '@/interfaces/request'
import type { Project, NewProject, PartialProject } from '@/interfaces/project'

const { projects, openDrawer, lastPersistedDraft, draftProject, activeProject } = projectStore

const { setStoredActiveProject } = useProjectSelected()


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

  const deleteProject = async (id: string): Promise<ResponseComposables<null>> => {
    loading.value = true

    try {
      await apiApp.delete(`/project/${id}`)
      projects.value = deleteFromArray(projects.value, id)
      successToast('Proyecto eliminado')
      return { success: true }
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


          console.log('data', data);
          
          if (activeProject.value?.id === draftProject.value?.id) {
            activeProject.value = {
              id: data.id,
              name: data.name,
              color: data.color,
            }
          }
        }

    } else {
      const payload = {
        name: snapshot.name as string,
        description: snapshot.description || null,
        color: snapshot.color,
      } 
    
      const { success, data } = await createProject(payload)

      if (!projects.value.length && !activeProject.value && data) {
        setStoredActiveProject({
          id: data.id,
          name: data.name,
          color: data.color,
        })
      }
  
      if (success && data && draftProject.value) {
        projects.value.unshift(data)
        draftProject.value.id = data.id
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
    deleteProject,
    showProjectsDrawer,
    saveDraft,
  }
}

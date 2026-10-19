## 1. Modal

- [x] 1.1 Add `RequirementTasksModal.vue` on `ModalBase` (`maxWidth="xl"`) and verify the header shows the requirement name and a close control hides the modal
- [x] 1.2 On open, load `getTasks({ projectId, requirementId })` and verify the table lists only that requirement's tasks
- [x] 1.3 Render locked `TaskForm` and `TaskList` in two columns from `md` up, stacked below `md`, and verify the form has no requirement selector
- [x] 1.4 Add **Todos**, **Pendientes**, and **Completadas**; verify **Pendientes** requests `completed: false`, **Completadas** requests `completed: true`, and **Todos** omits `completed`
- [x] 1.5 Save a new task with the open requirement id and without `projectId`; verify the created row appears and belongs to that requirement
- [x] 1.6 Wire edit, cancel, complete, and delete to the existing task actions; verify cancel clears the draft and leaves the modal open, and complete toggles the row without opening the form

## 2. Requirements page

- [x] 2.1 Emit `tasks` from the **Tareas** button in `RequirementList` and verify it does not emit `select`
- [x] 2.2 Open `RequirementTasksModal` from `RequirementsView` for that requirement and verify the name field is unchanged
- [x] 2.3 Remove the commented task block and the unused task state from `RequirementsView`; verify the page no longer renders a task list outside the modal
- [x] 2.4 Close the modal when `activeProject.id` changes and verify the list reloads for the new project

## 3. Check

- [x] 3.1 On a narrow viewport, verify the form sits above the table inside the modal and the requirement row actions wrap
- [x] 3.2 Run `pnpm exec vue-tsc --noEmit` in `mission-log` and verify it exits 0

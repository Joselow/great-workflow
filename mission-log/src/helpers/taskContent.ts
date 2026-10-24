export const taskEntityContent = (task: { name: string; description: string }) => {
  if (!task.description.trim()) return `*${task.name}*`

  return `*${task.name}*\n\n${task.description}
    `
}

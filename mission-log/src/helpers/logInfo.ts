import { formatHours } from "@/utils/date"

import type { Log } from "@/interfaces/Log"

export const generateLogInfo = (selectedLog: Log) => {
    let data = `
        Registrado Fecha: ${formatHours(selectedLog.createdAt)} 
        \ntags: ${selectedLog.tags}   
        \n## Descripción\n${selectedLog.description}
        \n## Responsable/Quien\n${selectedLog.responsible}
        \n## Estado\n${selectedLog.completed ? 'Solucionado' : 'Pendiente'}   
    `

    if (selectedLog.comment) {
        data += `\n## Comentario/Observación\n${selectedLog.comment}
        `
    }

    return data.trim()
}
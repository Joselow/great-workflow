import { formatHours } from "@/utils/date"

import type { Log } from "@/interfaces/Log"

export const generateLogInfo = (selectedLog: Log) => {
    let data = `
        # *Incidencia* ${formatHours(selectedLog.createdAt)}\n${selectedLog.tags}
        \n${selectedLog.description}
        \nReportado por: ${selectedLog.responsible}
        \n# *Solución*\n${selectedLog.comment ?? 'En analisis'}\n# *Estado*\n${selectedLog.completed ? 'Solucionado' : 'Pendiente'}
    `
    return data.trim()
}
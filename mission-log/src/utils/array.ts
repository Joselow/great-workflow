export const deleteFromArray = <T extends { id: string }>(array: T[], idRecord: T['id']): T[] => {
    const newArray = [...array]
    const index = newArray.findIndex(({ id }) => id === idRecord)
    if (index !== -1) {
        newArray.splice(index, 1)
    }
    return newArray
}

export const updateFromArray = <T extends { id: string }>(array: T[], record: T): T[] => {
    const newArray = [...array]
    const index = newArray.findIndex(({ id }) => id === record.id)
    if (index !== -1) {
        newArray[index] = record
    }
    return newArray
}

import { DEFAULT_PROJECT_COLOR } from "@/constants/projectColors";
import type { PartialProject } from "@/interfaces/project";

export const snapshotsEqual = (a: PartialProject, b: PartialProject) => {

    console.log('a', a);
    console.log('b', b);
    
    return a.id == b.id &&
    a.name === b.name &&
    a.description === b.description &&
    a.color === b.color
}

export const toSnapshot = (draft: PartialProject): PartialProject => ({
    id: draft.id ?? null,
    name: draft.name?.trim() || '',
    description: draft.description?.trim() || '',
    color: draft.color || DEFAULT_PROJECT_COLOR,  
})
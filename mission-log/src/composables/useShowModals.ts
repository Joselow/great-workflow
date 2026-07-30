import { ref, toRef, isRef, type Ref } from 'vue';

type UseShowStatesReturn = {
    [key: string]: any;
}

export function useShowModal(name: string, newState: Ref | null = null): UseShowStatesReturn {
    const nameState = name
    const nameUpperCase = name.charAt(0).toUpperCase() + name.slice(1)
    const nameShowState = `show${nameUpperCase}`
    const nameHideState = `hide${nameUpperCase}`

    const state = isRef(newState)
                ? toRef(newState)
                : ref(false)
    return {
        [nameState]: state,
        [nameShowState]: () => state.value = true,
        [nameHideState]: () => state.value = false,
    };
}
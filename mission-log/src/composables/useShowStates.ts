import { ref} from 'vue';

type UseShowStatesReturn = {
  [key: string]: any;
}

export function useShowStates(name: string): UseShowStatesReturn {
  const nameState = name
  const nameUpperCase = name.charAt(0).toUpperCase() + name.slice(1)
  const nameShowState = `on${nameUpperCase}`
  const nameHideState = `off${nameUpperCase}`

  const state = ref(false);

  return {
    [nameState]: state,
    [nameShowState]: () => state.value = true,
    [nameHideState]: () => state.value = false,
  };
}
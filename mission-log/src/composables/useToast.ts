import { ref, type Ref} from 'vue';

interface Toast {
  id?:  string
  msg?: string
  time?: number
  css?: string
  html?: boolean
}

const toasts: Ref<Toast[]> = ref([])

export function useToast() {
  const launchToast = ({ msg, time, css = '', html} : Toast) => {    
    const id = crypto.randomUUID()
    const toast: Toast = { msg, time, css, id, html }    
    toasts.value.push(toast);
  };
  
  const hideToast = async(id: string) => {
    const index = toasts.value.findIndex((item) => item.id === id);

    if (index >= 0) {
      toasts.value.splice(index, 1);
    }    
  };

  const hideAllToasts = () => toasts.value = []

  return {
    launchToast, toasts, hideToast, hideAllToasts
  }
}
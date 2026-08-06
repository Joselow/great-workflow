
<!-- ToastList.vue -->
<!--   
  Necesita: 
    Component TOAST que emita envento remove cuando se acaba el time que se le pasa como prop.
    Composable useToast() - donde aya une stado global, y metodos launchToast y hideToast
  USO: importas el launcher. y podras lanzar toast en cualquier lugar con las funciones del composable
  * importar solo una intancia o entrará en conflicto con la otra
    recomendable importarlo en la raiz 
-->
<script setup lang="ts">
import { onUnmounted } from 'vue'
import ToastItem from './ToastItem.vue';
import { useToast } from '@/composables/useToast'

const { toasts, hideToast, hideAllToasts } = useToast()

onUnmounted(() => {
  hideAllToasts()
})

const handleRemoveToast = (id?: string) => {
  if (id) {
    hideToast(id)
  }
}
</script>

<template>
  <Teleport to='body' >
    <div v-if="toasts.length > 0" class="fixed top-4 right-0 z-[90] px-4">
      <TransitionGroup name="list" tag="ul" appear >
        <li v-for="(toast) in toasts" :key="toast.id" class="py-2 w-auto">
          <ToastItem 
            @remove="handleRemoveToast"
            :id="toast.id"
            :css="toast.css"
            :msg="toast.msg"
            :time="toast.time"
            :html="toast.html"
          /> 
        </li>
      </TransitionGroup >
    </div>
  </Teleport>
</template>
<style scoped>
.list-enter-from{
  transform: scale(0.6);
  transform: translateX(60px);
  opacity: 0;
}

.list-leave-to{
  /* transform: scale(0); */
  transform: translateX(60px);
  opacity: 0;
}
.list-enter-active{
  transition: all .4s ease-out;
}

.list-leave-active{
  transition: all .25s ease;
  position: absolute;
}

.list-move{
  transition: all 0.3s ease;
}
</style>
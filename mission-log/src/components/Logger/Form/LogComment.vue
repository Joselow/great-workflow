<script setup lang="ts">

</script>

<template>
  <div>
    <label for="message" class="block mb-2.5 text-sm font-medium text-heading">Comentario</label>
    <textarea id="message" rows="2" 
        class="rounded-lg bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block 
        w-90 p-2  shadow-xs placeholder:text-body" placeholder="Escribe una reflexión, idea, dato adicional">
    </textarea>
    <button type="button" class="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 
        py-1.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">
        Guardar Comentario
    </button>
  </div>
</template>

<style scoped>

</style>
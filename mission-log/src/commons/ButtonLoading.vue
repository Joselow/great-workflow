<script setup lang="ts">
defineProps<{ loading: boolean }>()

</script>
<template>
  <button :disabled="loading" 
    class=" disabled:opacity-50 text-lowercase">
    <template v-if="loading" >
      <slot name='load'>
        <div class="loader " /> Loading...
      </slot>
    </template>
    <template v-else>
          <slot />
    </template>
  </button>
</template>

<style scoped>
/* HTML: <div class="loader"></div> */
.loader {
  display: inline-block;
  height: 15px;
  aspect-ratio: 1.5;
  --c:no-repeat linear-gradient(#fff 0 0);
  background:var(--c), var(--c);
  background-size: 66% 50%;
  animation: l1 1.5s infinite linear;
}
@keyframes l1 {
  0%  {background-position:0    0,0    100%}
  25% {background-position:100% 0,0    100%}
  47%,
  53% {background-position:100% 0,100% 100%}
  75% {background-position:0    0,100% 100%}
  100%{background-position:0    0,0    100%}
}
</style>
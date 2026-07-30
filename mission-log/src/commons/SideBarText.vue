<script setup lang="ts">
import { ref, watch } from 'vue';


interface Props {
  textData?: string
}

const props = defineProps<Props>()

const data =  ref('')

watch(() => props.textData , (value) => {
  if (value) {
    data.value = value
  } else {
    data.value = ''
  }
});

</script>

<template>
  <div class="">
    <textarea class="w-full px-2 py-2" name="" id=""
    rows="20"
      v-model="data"
    ></textarea>
  </div>
</template>

<style scoped>

</style>
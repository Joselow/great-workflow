<script setup lang="ts">
defineProps<{
  id: string
  label: string
  type?: string
  autocomplete?: string
  error?: string | null
}>()

const modelValue = defineModel<string>({ default: '' })
</script>

<template>
  <div>
    <div class="relative z-0 w-full group">
      <input
        :id="id"
        :name="id"
        :type="type ?? 'text'"
        :autocomplete="autocomplete"
        v-model="modelValue"
        class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-brand-cyan focus:outline-none focus:ring-0 focus:border-brand-cyan peer"
        :class="{ '!border-brand-pink dark:!border-brand-pink': error }"
        placeholder=" "
        required
      />
      <label
        :for="id"
        class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-brand-cyan peer-focus:dark:text-brand-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
      >
        {{ label }}
      </label>
    </div>
    <p v-if="error" class="mt-1 text-xs text-brand-pink">{{ error }}</p>
  </div>
</template>

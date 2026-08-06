<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import AuthLayout from '@/layouts/AuthLayout.vue'
import FormInput from '@commons/FormInput.vue'
import ButtonLoading from '@commons/ButtonLoading.vue'

import { useAuth } from '@/composables/useAuth'

import type { LoginCredentials } from '../../interfaces/auth'

const router = useRouter()
const { login, loading } = useAuth()

const form = reactive<LoginCredentials>({
  email: '',
  password: '',
})

const loadingRedirect = ref(false)

const handleSubmit = async () => {
  const success = await login(form)

  if (success) {
    loadingRedirect.value = true
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <AuthLayout
   :loading="loadingRedirect"
    title="Bienvenido de nuevo"
    subtitle="Inicia sesión para continuar con tu flujo de trabajo"
  >
    <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <FormInput
        id="email"
        label="Correo electrónico"
        type="email"
        autocomplete="email"
        v-model="form.email"
      />
      <FormInput
        id="password"
        label="Contraseña"
        type="password"
        autocomplete="current-password"
        v-model="form.password"
      />

      <ButtonLoading
        :loading="loading"
        type="submit"
        class="cursor-pointer rounded-md bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-95 active:brightness-90 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 disabled:opacity-50"
      >
        Iniciar sesión
      </ButtonLoading>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      ¿No tienes cuenta?
      <RouterLink :to="{ name: 'register' }" class="font-semibold text-brand-cyan hover:underline">
        Regístrate
      </RouterLink>
    </p>
  </AuthLayout>
</template>

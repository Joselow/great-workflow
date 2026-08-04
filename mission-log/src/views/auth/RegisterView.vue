<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { reactive, ref } from 'vue'

import AuthLayout from '@/layouts/AuthLayout.vue'
import FormInput from '@commons/FormInput.vue'
import ButtonLoading from '@commons/ButtonLoading.vue'
import FullScreenLoader from '@/commons/FullScreenLoader.vue'

import { useAuth } from '@/composables/useAuth'
import { errorToast } from '@/composables/useAlerts'

import type { RegisterCredentials } from '@/interfaces/auth'

const router = useRouter()
const { register, loading } = useAuth()

const form = reactive<RegisterCredentials>({
  name: '',
  email: '',
  password: '',
})

const confirmPassword = ref('')

const loadingFullScreen = ref(false)

const handleSubmit = async () => {
  if (form.password !== confirmPassword.value) {
    errorToast('Las contraseñas no coinciden')
    return
  }

  const success = await register(form)

  if (success) {
    loadingFullScreen.value = true
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div>
    <FullScreenLoader v-if="loadingFullScreen"/>

    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Regístrate para empezar a centralizar tu flujo de trabajo"
    >
      <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
        <FormInput
          id="name"
          label="Nombre"
          autocomplete="name"
          v-model="form.name"
        />
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
          autocomplete="new-password"
          v-model="form.password"
        />
        <FormInput
          id="confirm-password"
          label="Confirmar contraseña"
          type="password"
          autocomplete="new-password"
          v-model="confirmPassword"
        />
  
        <ButtonLoading
          :loading="loading"
          type="submit"
          class="cursor-pointer rounded-md bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-95 active:brightness-90 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 disabled:opacity-50"
        >
          Crear cuenta
        </ButtonLoading>
      </form>
  
      <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿Ya tienes cuenta?
        <RouterLink :to="{ name: 'login' }" class="font-semibold text-brand-cyan hover:underline">
          Inicia sesión
        </RouterLink>
      </p>
    </AuthLayout>
  </div>
</template>

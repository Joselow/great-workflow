<script setup lang="ts">
import { RouterView } from 'vue-router';

import Header from './components/Header.vue';
import ToastLauncher from './commons/ToastLauncher.vue';

import { useAuth } from './composables/useAuth';

const { logout } = useAuth();

const handleLogout = () => {
  logout();
};
</script>

<template>
  <div class=" w-7xl min-h-screen transition-colors mx-auto">
    <ToastLauncher/>
    <Header :full="true" @logout="handleLogout" />
    <main class="p-6 w-6xl mx-auto">
      <RouterView />
    </main>
  </div>
</template>

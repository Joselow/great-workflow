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
  <div class=" min-h-screen transition-colors mx-auto">
    <ToastLauncher/>
    <Header 
      class="max-w-6xl"
      :full="true" @logout="handleLogout" />
    <main class="p-6  w-full">
        <RouterView />
    </main>
  </div>
</template>

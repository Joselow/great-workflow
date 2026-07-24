<script setup lang="ts">
import Header from './components/Header.vue';
import { useAuth } from './composables/useAuth';

const { logout } = useAuth();

const handleLogout = () => {
  logout();
};
</script>

<template>
  
  <div class="min-h-screen w-full transition-colors max-w-2xl mx-auto">
    <Header @logout="handleLogout" />

    <main class="p-6">
    </main>
  </div>
</template>

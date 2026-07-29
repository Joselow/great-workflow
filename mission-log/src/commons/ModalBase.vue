<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
    maxWidth: {
        type: String,
        default: 'md'
    },
    closeable: {
        type: Boolean,
        default: true
    }
});

const show = defineModel({ default: false })


const tryCloseModal = ref(false)

const close = () => {
  if (props.closeable) {
    show.value = false
  }

  launchAnimation()
}

const launchAnimation = () => tryCloseModal.value = true
const endAnimation = () => tryCloseModal.value = false

const closeOnEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && show) {
        close();
    }
};

onMounted(() => document.addEventListener('keydown', closeOnEscape));

onUnmounted(() => {
    document.removeEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'visible';
});

const maxWidthClass = computed(() => {
  return {
    sm: 'sm:w-3/4 md:w-5/12 lg:w-3/9 xl:w-1/4',
    md: 'sm:w-9/12 md:w-8/12 lg:w-6/12',
    lg: 'sm:w-5/6 lg:w-4/6',
    xl: 'sm:w-11/12',
    'full': 'sm:w-full'
  }[props.maxWidth];
});

</script>

<template>
    <Teleport to="body">
        <Transition leave-active-class="duration-200">
            <div
            v-show="show"
            class="text-gray-300 fixed inset-0 overflow-y-auto z-50"
            :class="{ 'dont-close': tryCloseModal, 'py-6 px-4': maxWidth !== 'full' }"
            @animationend="endAnimation"
            >
            <!-- Fondo oscuro -->
            <Transition
                enter-active-class="ease-out duration-300"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="ease-in duration-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div
                v-show="show"
                class="fixed inset-0 bg-gray-500 dark:bg-gray-900 opacity-75 z-40"
                @click="close"
                />
            </Transition>

            <!-- Contenido del modal -->
            <Transition
                enter-active-class="ease-out duration-300"
                enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enter-to-class="opacity-100 translate-y-0 sm:scale-100"
                leave-active-class="ease-in duration-200"
                leave-from-class="opacity-100 translate-y-0 sm:scale-100"
                leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
                <div
                v-show="show"
                class="relative z-50 mb-6 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all mx-auto"
                :class="maxWidthClass"
                >
                <slot />
                </div>
            </Transition>
            </div>
        </Transition>
    </Teleport>
</template>
<style scoped>
@keyframes crecerYVolver {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.dont-close {
  animation: crecerYVolver 0.35s ease-out;
}
</style>
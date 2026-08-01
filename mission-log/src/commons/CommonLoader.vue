<template>
  <Teleport to='body'>
    <div class="absolute top-5 start-6" style="z-index: 100;">
      <span class="loader"></span>
    </div>
  </Teleport>
</template>

<style scoped>

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
}

.loader {
  width: 40px;
  height: 40px;
  border: 4.5px solid #ffa484;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 0.8s linear infinite;
}

@keyframes rotation {
  0% {
      transform: rotate(0deg);
  }
  100% {
      transform: rotate(360deg);
  }
} 
</style>
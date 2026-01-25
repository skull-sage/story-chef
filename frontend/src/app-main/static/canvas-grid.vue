<template>
  <div class="canvas-grid" :style="canvasStyle">
    <div v-if="showGrid" class="grid-pattern" :style="gridStyle" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Size } from './types';

interface Props {
  canvasSize: Size;
  gridSize?: number;
  showGrid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  gridSize: 4,
  showGrid: true
});

const canvasStyle = computed(() => ({
  width: `${props.canvasSize.width}px`,
  height: `${props.canvasSize.height}px`
}));

const gridStyle = computed(() => ({
  backgroundSize: `${props.gridSize}px ${props.gridSize}px`
}));
</script>

<style scoped>
.canvas-grid {
  position: relative;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(to right, #f0f0f0 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
  pointer-events: none;
  opacity: 0.5;
}
</style>

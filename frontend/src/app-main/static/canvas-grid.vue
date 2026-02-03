<template>
  <div class="canvas-grid" :style="canvasStyle">
    <canvas ref="gridCanvas" class="grid-pattern" />
    <slot />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { Size } from './types';

interface Props {
  canvasSize: Size;
  gridSize?: number;
  showGrid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  gridSize: 16,
  showGrid: true
});

const gridCanvas = ref<HTMLCanvasElement | null>(null);

const canvasStyle = computed(() => ({
  width: `${props.canvasSize.width}px`,
  height: `${props.canvasSize.height}px`
}));

const drawGrid = () => {
  const canvas = gridCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = props.canvasSize.width;
  const height = props.canvasSize.height;
  const step = props.gridSize;

  // Set canvas resolution
  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  if (!props.showGrid) return;

  ctx.fillStyle = '#d0d0d0';

  // Draw dots
  for (let x = step; x < width; x += step) {
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      // 1px radius = 2px diameter
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

onMounted(() => {
  drawGrid();
});

watch(() => [props.canvasSize, props.gridSize, props.showGrid], () => {
  drawGrid();
}, { deep: true });
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
  pointer-events: none;
  opacity: 0.8;
}
</style>

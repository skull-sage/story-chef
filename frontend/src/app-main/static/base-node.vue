<template>
  <div
    ref="nodeRef"
    class="base-node"
    :class="{ selected: isSelected, dragging: isDragging }"
    :style="nodeStyle"
    @click.stop="handleSelect"
  >
    <slot />

    <!-- Selection handles -->
    <div v-if="isSelected && !isDragging" class="selection-handles">
      <div class="handle top-left" @mousedown.stop="handleResize('top-left')" />
      <div class="handle top-right" @mousedown.stop="handleResize('top-right')" />
      <div class="handle bottom-left" @mousedown.stop="handleResize('bottom-left')" />
      <div class="handle bottom-right" @mousedown.stop="handleResize('bottom-right')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDrag } from './composables/use-drag';
import { Position, Size } from './types';

interface Props {
  id: string;
  position: Position;
  size: Size;
  rotation?: number;
  zIndex?: number;
  isSelected?: boolean;
}

interface Emits {
  (e: 'update:position', position: Position): void;
  (e: 'update:size', size: Size): void;
  (e: 'select', id: string): void;
  (e: 'drag-start', id: string): void;
  (e: 'drag', position: Position): void;
  (e: 'drag-end', position: Position): void;
}

const props = withDefaults(defineProps<Props>(), {
  rotation: 0,
  zIndex: 1,
  isSelected: false
});

const emit = defineEmits<Emits>();

const nodeRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

const { dragState } = useDrag(nodeRef, {
  onDragStart: (position) => {
    isDragging.value = true;
    emit('drag-start', props.id);
  },
  onDrag: (position) => {
    emit('drag', position);
    emit('update:position', position);
  },
  onDragEnd: (position) => {
    isDragging.value = false;
    emit('drag-end', position);
    emit('update:position', position);
  }
});

const nodeStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  width: `${props.size.width}px`,
  height: `${props.size.height}px`,
  transform: `rotate(${props.rotation}deg)`,
  zIndex: props.zIndex
}));

const handleSelect = () => {
  emit('select', props.id);
};

const handleResize = (corner: string) => {
  // TODO: Implement resize functionality
  console.log('Resize from:', corner);
};
</script>

<style scoped>
.base-node {
  position: absolute;
  cursor: move;
  user-select: none;
  box-sizing: border-box;
}

.base-node.selected {
  outline: 2px solid #4285f4;
  outline-offset: 2px;
}

.base-node.dragging {
  opacity: 0.8;
  cursor: grabbing;
}

.selection-handles {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  pointer-events: none;
}

.handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #4285f4;
  border: 2px solid white;
  border-radius: 50%;
  pointer-events: all;
  cursor: pointer;
}

.handle.top-left {
  top: 0;
  left: 0;
  cursor: nw-resize;
}

.handle.top-right {
  top: 0;
  right: 0;
  cursor: ne-resize;
}

.handle.bottom-left {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
}

.handle.bottom-right {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}
</style>

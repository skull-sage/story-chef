<template>
  <base-node
    :id="node.id"
    :position="node.position"
    :size="node.size"
    :rotation="node.rotation"
    :z-index="node.zIndex"
    :is-selected="isSelected"
    @update:position="updatePosition"
    @update:size="updateSize"
    @select="$emit('select', node.id)"
    @drag-start="$emit('drag-start', node.id)"
    @drag="$emit('drag', $event)"
    @drag-end="$emit('drag-end', $event)"
  >
    <div class="image-container" :style="containerStyle">
      <img
        v-if="node.src"
        :src="node.src"
        :style="imageStyle"
        alt="Image node"
        draggable="false"
      />
      <div v-else class="image-placeholder" @click="handleImageUpload">
        <q-icon name="add_photo_alternate" size="48px" color="grey-5" />
        <div class="text-grey-6">Click to add image</div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
  </base-node>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseNode from './base-node.vue';
import { ImageNode, Position, Size } from './types';

interface Props {
  node: ImageNode;
  isSelected?: boolean;
}

interface Emits {
  (e: 'update:node', node: ImageNode): void;
  (e: 'select', id: string): void;
  (e: 'drag-start', id: string): void;
  (e: 'drag', position: Position): void;
  (e: 'drag-end', position: Position): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
});

const emit = defineEmits<Emits>();

const fileInputRef = ref<HTMLInputElement | null>(null);

const containerStyle = computed(() => ({
  borderRadius: `${props.node.borderRadius}px`,
  border: props.node.borderWidth > 0
    ? `${props.node.borderWidth}px solid ${props.node.borderColor}`
    : 'none',
  boxShadow: props.node.shadowBlur > 0
    ? `0 0 ${props.node.shadowBlur}px ${props.node.shadowColor}`
    : 'none',
  overflow: 'hidden'
}));

const imageStyle = computed(() => ({
  filter: `brightness(${props.node.filters.brightness}%) contrast(${props.node.filters.contrast}%) saturate(${props.node.filters.saturation}%)`,
  width: '100%',
  height: '100%',
  objectFit: 'cover'
}));

const handleImageUpload = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedNode = {
        ...props.node,
        src: e.target?.result as string
      };
      emit('update:node', updatedNode);
    };
    reader.readAsDataURL(file);
  }
};

const updatePosition = (position: Position) => {
  const updatedNode = {
    ...props.node,
    position
  };
  emit('update:node', updatedNode);
};

const updateSize = (size: Size) => {
  const updatedNode = {
    ...props.node,
    size
  };
  emit('update:node', updatedNode);
};
</script>

<style scoped>
.image-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.image-placeholder:hover {
  background-color: #eeeeee;
}

img {
  display: block;
  user-select: none;
  pointer-events: none;
}
</style>

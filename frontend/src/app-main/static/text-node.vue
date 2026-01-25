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
    <div
      ref="textContentRef"
      class="text-content"
      :contenteditable="isSelected"
      :style="textStyle"
      @input="handleTextInput"
      @blur="handleBlur"
    >
      {{ node.content }}
    </div>
  </base-node>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseNode from './base-node.vue';
import { TextNode, Position, Size } from './types';

interface Props {
  node: TextNode;
  isSelected?: boolean;
}

interface Emits {
  (e: 'update:node', node: TextNode): void;
  (e: 'select', id: string): void;
  (e: 'drag-start', id: string): void;
  (e: 'drag', position: Position): void;
  (e: 'drag-end', position: Position): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
});

const emit = defineEmits<Emits>();

const textContentRef = ref<HTMLElement | null>(null);

const textStyle = computed(() => ({
  fontSize: `${props.node.fontSize}px`,
  fontFamily: props.node.fontFamily,
  color: props.node.color,
  textAlign: props.node.textAlign,
  fontWeight: props.node.fontWeight,
  fontStyle: props.node.fontStyle,
  textDecoration: props.node.textDecoration,
  lineHeight: props.node.lineHeight,
  letterSpacing: `${props.node.letterSpacing}px`
}));

const handleTextInput = (event: Event) => {
  const target = event.target as HTMLElement;
  const updatedNode = {
    ...props.node,
    content: target.innerText
  };
  emit('update:node', updatedNode);
};

const handleBlur = () => {
  // Ensure content is synced on blur
  if (textContentRef.value) {
    const updatedNode = {
      ...props.node,
      content: textContentRef.value.innerText
    };
    emit('update:node', updatedNode);
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
.text-content {
  width: 100%;
  height: 100%;
  outline: none;
  padding: 8px;
  box-sizing: border-box;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
}

.text-content:focus {
  background-color: rgba(66, 133, 244, 0.05);
}
</style>

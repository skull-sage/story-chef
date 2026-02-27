<template>
  <div
  :key="node.renderKey"
    ref="rootRef"
    class="editable-content"
    contenteditable="true"
    @keydown="onKeydown"
    @mouseup="onMouseup"
  >
    <template v-for="(item, idx) in node.content" :key="idx">
      <NodeText v-if="'text' in item" :node="item as InlineText" />
      <span
        v-else
        contenteditable="false"
        class="atom-element"
      >
        {{ (item as InlineAtom).name }}
      </span>


    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { BlockText } from '../text-types';
import NodeText from './node-text.vue';
import { InlineAtom, InlineText } from '../text-types';
import { useBlockTextEvents } from './use-block-text-events';

// Props receive shallowReactive data from parent
const props = defineProps<{
  node: BlockText;
}>();

const rootRef = ref<HTMLElement | null>(null);

const { onSelectionChange, onMouseup, onKeydown } = useBlockTextEvents(
  () => props.node,
  rootRef,
);

onMounted(() => {
  document.addEventListener('selectionchange', onSelectionChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', onSelectionChange);
});

</script>

<style scoped>
.editable-content {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 2px;
  background: white;
  line-height: 1.6;
  font-size: 1.1rem;
  outline: none;
  transition: box-shadow 0.2s;
}

.editable-content:focus {
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  border-color: #4299e1;
}


.atom-element {
  display: inline-block;
  padding: 2px 8px;
  margin: 0 2px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #555;
  font-size: 0.9em;
  user-select: none;
}
</style>

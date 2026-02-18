<template>
  <div
    ref="rootRef"
    class="editable-content"
    contenteditable="true"
  >
    <template v-for="(item, idx) in content" :key="idx">
      <span
        v-if="item.type === 'text'"
        :class="item.mark?.styleClz"
        :style="item.mark?.color ? `background-color: ${item.mark.color}` : ''"
      >{{ item.text }}</span>
      <span
        v-else-if="item.type === 'atom'"
        contenteditable="false"
        class="atom-element"
      >
        {{ item.attrs?.placeholder || item.name }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTextEditor } from './use-text-editor';

// Props receive shallowReactive data from parent
const props = defineProps<{
  id: number;
  content: any[];
}>();

const rootRef = ref<HTMLElement | null>(null);

const { updateSelection, selectionState } = useTextEditor(rootRef);

defineExpose({
    updateSelection,
    selectionState
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

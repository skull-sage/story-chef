<template>
  <div
    ref="rootRef"
    class="editable-content"
    contenteditable="true"
  >
    <template v-for="(item, idx) in content" :key="idx">
      <span
        :data-offset="item.offset"
        v-if="item.type === 'text'"
        :class="getMarkClass(item.mark)"
        :style="getMarkStyle(item.mark)"
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
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { InlineType, MarkType } from './text-inline';
import { TextSelection, calcTextLocalSelection } from './text-selection';

// Helper functions for safely accessing mark properties since MarkType union is disjoint
const getMarkClass = (mark?: MarkType) => {
  if (mark && mark.type === 'highlight') {
    return mark.styleClz;
  }
  return '';
};

const getMarkStyle = (mark?: MarkType) => {
  if (mark && mark.type === 'highlight' && mark.color) {
    return `background-color: ${mark.color}`;
  }
  return '';
};

// Props receive shallowReactive data from parent
const props = defineProps<{
  id: number;
  content: (InlineType | InlineAtom)[];
}>();

const rootRef = ref<HTMLElement | null>(null);
const selectionState = ref<TextSelection | null>(null);

const updateSelection = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {
            return null;
        }
        selectionState.value = calcTextLocalSelection(sel, rootRef.value.children, props.content);
};

onMounted(() => {
      document.addEventListener('selectionchange', updateSelection);
  });

onBeforeUnmount(() => {
      document.removeEventListener('selectionchange', updateSelection);
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

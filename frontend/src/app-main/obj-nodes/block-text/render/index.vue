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
       <span
        v-if="item instanceof InlineAtom"
        contenteditable="false"
        class="atom-element"
      >
        {{ (item as InlineAtom).name }}
      </span>
      <NodeText v-else :node="item as InlineText" />

    </template>
  </div>
</template>

<script setup lang="ts">
import { isReactive, onBeforeUnmount, onMounted, ref } from 'vue';
import type { BlockText } from '../block-type';
import { type TextSelection, calcTextLocalSelection } from '../text-selection';
import NodeText from './node-text.vue';
import CmdsText from '../cmds-basic';
import { markForKey } from '../keybindings';
import { InlineAtom, InlineText } from '../text-inline';


// Props receive shallowReactive data from parent
const props = defineProps<{
  node: BlockText;
}>();

const rootRef = ref<HTMLElement | null>(null);
let selectionState:TextSelection = undefined;

const updateSelection = () => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    selectionState = undefined;
    return;
  }
  selectionState = calcTextLocalSelection(sel, rootRef.value.children, props.node.content);
};

const onMouseup = () => {
  console.log('selection:', selectionState);
};

const onKeydown = (e: KeyboardEvent) => {
  const mark = markForKey(e);
  if (!mark) return;
  e.preventDefault();
  console.log(e, mark)
  const sel = selectionState;
  if (!sel) return;
  CmdsText.applyMark(props.node, mark, sel);


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

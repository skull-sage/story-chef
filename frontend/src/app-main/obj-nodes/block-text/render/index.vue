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
      <InlineTextNode v-if="item.type === 'text'" :node="item" />
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
import { isReactive, onBeforeUnmount, onMounted, ref } from 'vue';
import type { InlineAtom, InlineText } from '../text-inline';
import type { BlockText } from '../block-type';
import { type TextSelection, calcTextLocalSelection } from '../text-selection';
import InlineTextNode from './inline-text.vue';
import CmdsText from '../cmds-text';
import { markForKey } from '../keybindings';


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
  CmdsText.toggleMark(props.node, mark, sel);
  console.log("isReactive", isReactive(props.node))
  console.log(props.node)

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

<template>
  <div
    ref="rootRef"
    class="editable-content"
    contenteditable="true"
    @mouseup="onMouseup"
    @keydown=" "
    @keyup=" "
    @focus="onFocus"
  ><TextContent :content="localNode?.content || []" /></div>
</template>

<script setup lang="ts">
import { ref, watch, markRaw, onMounted, onBeforeUnmount, shallowReactive, shallowRef } from 'vue';
import type { PropType } from 'vue';
import { $BlockText, COMMON_MARK, type BlockText, type InlineAtom, type InlineText, type InlineType } from '../text-types';
import TextContent from './text-content.vue';
import CmdsText, { FlatContent } from '../cmds-basic';
import { KEY_MAPPING } from '../cmd-mapping';
import { SelectionState, TextSelection } from '../text-selection';

const props = defineProps({
  modelValue: {
    type: Object as PropType<BlockText>,
    required: false
  }
});

const emit = defineEmits(['update:modelValue']);

const rootRef = ref<HTMLElement | null>(null);
let localNode = shallowReactive(undefined as BlockText | undefined);
const selState = shallowRef<SelectionState>();

let pKeyDown = '';
let mutationObserver: MutationObserver | null = null;

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal === undefined || newVal !== localNode) {
      localNode = shallowReactive($BlockText.sanitize(newVal as BlockText));
    }
  },
  { immediate: true }
);


const onMouseup = () => {
  // onMouseup logic placeholder
};

const onFocus = () => {
  if (localNode?.content.length > 0)
    return;

    // we want to handle only the case when the node is empty

  const rootEl = rootRef.value;
  if (!rootEl) return;

  const lastEl = rootEl.lastElementChild;
  if (!lastEl) return;
  debugger;

  const firstChild = lastEl.firstChild;
  if (!firstChild) return;

  const sel = window.getSelection();
  if (sel) {
    const range = document.createRange();
    range.setStart(firstChild, 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
};

const onKeyup = (e: KeyboardEvent) => {
  pKeyDown = '';
};

const onKeyDown = (e: KeyboardEvent) => {
  const keyStr = e.key;

  if (keyStr === 'Backspace') {
    e.preventDefault();
    if (localNode.value && selState.value) {
      CmdsText.makeDeleteLeft()(localNode.value, selState.value);
    }
    return;
  }

  if (keyStr.length > 1) {
    return; // pass mod keys Ctrl/Alt/Shift to the dom
  }

  e.preventDefault();
  console.log('#Input Key Str:', keyStr, 'length:', keyStr.length, 'code-point:', keyStr.charCodeAt(0));

  if (pKeyDown) {
    return;
  }
  pKeyDown += keyStr;

  console.log('#COMMON MARK', COMMON_MARK);

  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
    let modKey = '';
    if (e.ctrlKey || e.metaKey) modKey += 'Ctrl+';
    if (e.altKey) modKey += 'Alt+';
    else if (e.shiftKey) modKey += 'Shift+';

    const fullKey = modKey + keyStr;
    const cmd = KEY_MAPPING[fullKey as keyof typeof KEY_MAPPING];
    if (!cmd) return;

    if (localNode.value && selState.value) {
      cmd(localNode.value, selState.value);
    }
    return;
  }

  if (localNode.value && selState.value) {
    CmdsText.makeReplaceText(keyStr)(localNode.value, selState.value);
  }
};

const onSelectionChange = () => {
  console.log('## SELECTION CHANGES', window.getSelection());
};

onMounted(() => {
  const rootEl = rootRef.value;
  if (!rootEl) return;

  Array.from(rootEl.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && /^\s+$/.test(node.nodeValue || '')) {
      rootEl.removeChild(node);
    }
  });

  selState.value = markRaw(new SelectionState(rootEl));
  document.addEventListener('selectionchange', onSelectionChange);

  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      console.log('*** MUTATION OBSERVED ***:', mutation);
    });
  });

  mutationObserver.observe(rootEl, {
    childList: true,
    subtree: true,
    characterData: true,
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', onSelectionChange);
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
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
  white-space: pre-wrap;
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

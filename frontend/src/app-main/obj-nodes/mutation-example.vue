<template>
  <div ref="rootRef" class="outline-1 q-pa-sm" contenteditable @keydown="handleKeydown">text <b>bold</b></div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue';

const rootRef = ref<HTMLElement | null>(null);

//mutation observer
const observer = new MutationObserver((mutations) => {
  console.log(`# NEW ${mutations.length} MUTATION `)

  mutations.forEach((mutation) => {
    console.log(mutation);
  });
  /**
   * Node removal:
   *
  */
  const sel = window.getSelection();
  const range = sel.getRangeAt(0);
  const newRange = document.createRange();
  newRange.selectNodeContents(rootRef.value);
  newRange.setStart(range.startContainer, range.startOffset);
  newRange.setEnd(range.endContainer, range.endOffset);
  sel.removeAllRanges();
  sel.addRange(newRange);
});

onMounted(() => {


  console.log("rootRef", rootRef.value);
  observer.observe(rootRef.value, {
    subtree: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true
  });

});

onBeforeUnmount(() => {
  observer.disconnect();

});


const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta']);
const IGNORED_SOLO_KEYS = new Set([...MODIFIER_KEYS, 'Backspace']);

const handleKeydown = (e: KeyboardEvent) => {
  e.preventDefault();
  const key = e.key;
  const hasModifier = e.ctrlKey || e.altKey || e.metaKey;

  // Ignore lone modifier / Backspace presses
  if (IGNORED_SOLO_KEYS.has(key)) return;

  // Modifier + key combo  (Ctrl+A, Ctrl+Shift+Z, etc.)
  if (hasModifier) {
    const parts: string[] = [];
    if (e.ctrlKey)  parts.push('Ctrl');
    if (e.altKey)   parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey)  parts.push('Meta');
    parts.push(key);
    console.log('Key input:', parts.join('+'));
    return;
  }

  // Single printable character (length === 1 covers letters, digits, symbols)
  if (key.length === 1) {
    console.log('Char input:', key);
  }
};
</script>
<style>
.outline-1 {
  outline: 1px solid #ddd;
}
</style>

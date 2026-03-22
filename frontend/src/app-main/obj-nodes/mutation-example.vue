<template>
  <div ref="rootRef" class="outline-1 q-pa-sm" contenteditable>text <b>bold</b></div>
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
  console.log("(|) SELECTION VALUE", sel)
});

onMounted(() => {

  document.addEventListener('selectionchange', () => {
    //selection.value = window.getSelection();
    //console.log("(|) SELECTION VALUE", selection.value)
  });

  console.log("rootRef", rootRef.value);
  observer.observe(rootRef.value, {
    subtree: true,
    characterData: true
  });

});

onBeforeUnmount(() => {
  observer.disconnect();

});

const handleInput = () => {
  console.log(rootRef.value?.innerHTML);
};
</script>
<style>
.outline-1 {
  outline: 1px solid #ddd;
}
</style>

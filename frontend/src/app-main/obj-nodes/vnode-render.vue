<template>
  <div id="rootRef" ref="rootRef" contenteditable="true" class="q-pa-sm outline-1" @keydown="onKeyDown"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, markRaw, h, render, Fragment, getCurrentInstance, shallowRef } from 'vue';
import AtomExm from './atom-exm.vue';
import { nextTick } from 'process';

type ContentNode = string | { type: 'atom', value: string };

const appContext = getCurrentInstance()?.appContext;
const rootRef = ref<HTMLElement | null>(null);
const content = markRaw<ContentNode[]>(['text', {type: 'atom', value: ' atom '}]);
const selection = shallowRef<Selection | null>(null);


const updateRenderer = (adjustFrom?:number, adjustTo?:number  ) => {
  if (!rootRef.value) return;

  const vnodes = content.map((item, index) => {
    if (typeof item === 'string') {
      return item;
    }
    if (item.type === 'atom') {
      const atomNode = h(AtomExm, {
        key: index,
        modelValue: item.value,
        'onUpdate:modelValue': (val: string) => {
          item.value = val;
          updateRenderer(); // Re-render when content updates
        }
      });
      atomNode.appContext = appContext;
      return atomNode;
    }
    return null;
  });
  // Render the VNodes into the container
  render(h(Fragment, null, vnodes), rootRef.value);

  if(adjustFrom && adjustTo){
    // for quick test we only need first text node

    // NOTE: childNodes[0] is a tmpty text node
    //  added by the initial fragment of render function render(h(Fragment, null, vnodes))
    // lets try from idx 1 for now
    const textNode = rootRef.value?.childNodes[1];
    const sel = window.getSelection();
    const range = document.createRange();
    //console.log("captured elm", rootRef.value);
    range.setStart(textNode, adjustFrom);
    range.setEnd(textNode, adjustTo);

     sel.removeAllRanges();
    sel.addRange(range);



  }
};

const onKeyDown = (evt: KeyboardEvent) => {

  if(evt.key.length > 1){
    return;
  }

  evt.preventDefault();

  let str = '';
  for(let idx=0; idx < 5000; idx++){
    str += idx + 'a'.charCodeAt(0);
  }

  const len = (content[0] as string).length;
  content[0] =  content[0] + evt.key;
  updateRenderer(len+1, len+1);

}

/**
 *  SELECTION change event should only be listened for informing
 *  selection change
 *  All EDITING should happen by reading window selection immediately-before applying
 *  an editing (text input, replace, atom-insert, atom-delete, etc)
*/

onMounted(() => {
  updateRenderer();
  // observer.observe(rootRef.value, {
  //   childList: true,
  //   subtree: true,
  //   characterData: true,
  // });
});
</script>
<style scoped>
.outline-1 {
  outline: 1px solid #ddd;
}
</style>

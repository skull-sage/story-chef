<template>
  <div class="dom-selection-demo">
    <div class="row">
      <div class="col-8">
        <div class="text-bold q-mb-md">Interactive Content</div>
        <BlockText v-bind="basicSample" ref="blockTextRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowReactive } from "vue";
import BlockText from "./block-text.vue";
import { basicSample as basicSampleData, utilCalcInlineOffset } from "./data-sample";

// Use shallowReactive to make the data shallow reactive
const basicSample = shallowReactive(basicSampleData);
utilCalcInlineOffset(basicSample.content);

const selectionState = ref<any>(null);

function calcTextSelection(selRange:Range, childList:Element[]) {
  let {startContainer, startOffset, endContainer, endOffset} = selRange;

  let start, end;
  for(let idx=0; idx < childList.length; idx++){
     let child = childList[idx];
     let offset = null;
     if(child.contains(startContainer)){
         start = {inlineIdx:idx, offset:startOffset};
     }
     if(child.contains(endContainer)){
          end = {inlineIdx:idx, offset:endOffset};
     }
  }

    return {start: start, end: end}

}

const updateSelection = () => {
  const sel = window.getSelection();
  if(!sel){
    selectionState.value = null;
    return;
  }

  if(sel.rangeCount > 0){
    let range = sel.getRangeAt(0);
    let selection = calcTextSelection(range);

    let focusXY = null;
    const targetElement = sel.focusNode.nodeType === Node.TEXT_NODE
      ? (sel.focusNode.parentElement as Element)
      : (sel.focusNode as Element);

    if(targetElement && targetElement.getBoundingClientRect){
      const rect = targetElement.getBoundingClientRect();
      focusXY = { x: rect.left, y: rect.top };
    }
    selectionState.value = {...selection, focusXY};
  }

};

onMounted(() => {
  document.addEventListener('selectionchange', updateSelection);
  // Initialize
  updateSelection();
});

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', updateSelection);
});
</script>

<style scoped>
.dom-selection-demo {
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
}




</style>

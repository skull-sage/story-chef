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
import BlockText from "./block-text/index.vue";
import { basicSample as basicSampleData, utilCalcInlineOffset } from "./data-samples/block-text";

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


</script>

<style scoped>
.dom-selection-demo {
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
}




</style>

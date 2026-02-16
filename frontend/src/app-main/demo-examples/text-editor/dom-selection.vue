<template>
  <div class="dom-selection-demo">
    <div class="row">
      <div class="col-8">
        <h3>Interactive Content</h3>
        <p class="instruction">Select text below to see selection details.</p>
        <div
          class="editable-content"
          contenteditable="true"
          ref="blockRoot"
        >
          <span>Text1 <span>Length</span> 15</span><span contenteditable="false"> Atom </span><span><em>Text2 Length 15</em></span>
        </div>
      </div>

      <div class="col-4">
        <h3>Selection State</h3>
        <SelectionStateView :selection-state="selectionState" />
        <div class="q-mt-md text-grey-8" v-if="nodes.length">
            Nodes Tracked: {{ nodes.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import SelectionStateView from "./selection-state.vue";

const selectionState = ref<any>(null);
const blockRoot = ref<HTMLElement | null>(null);

function calcIdx(sel:Selection, childList:HTMLCollection) {
  let {anchorNode, anchorOffset, focusNode, focusOffset} = sel;

  let selectedList = [];

  for(let idx=0; idx < childList.length; idx++){
     let child = childList[idx];
     let hasAnchorOrFocus = child === anchorNode || child.contains(anchorNode) || child === focusNode || child.contains(focusNode);

     if(hasAnchorOrFocus){
      if(child.getAttribute('contenteditable') === 'false'){
        break;
      } else {
        selectedList.push({inlineIdx:idx, offset:child});
      }
     }
  }

}

const updateSelection = () => {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) {
    selectionState.value = null;
    return;
  }

   let startIdx = null, endIdx = null;
  if (blockRoot.value) {

    let childList = Array.from(blockRoot.value.children);
    for(let idx=0; idx < childList.length; idx++){
      let child = childList[idx];
      if(sel.anchorNode === child || child.contains(sel.anchorNode)){
        if(child.getAttribute('contenteditable') === 'false'){
          break;
        } else {

        }

      }
      if(child.getAttribute('contenteditable') === 'false'){
        startIdx++;
      }
      else{
        endIdx++;
      }
    }
    Array.from(blockRoot.value.children).forEach((child) => {
      // implement condition: if child type is contenteditable == false
      // let startOffset = 0, endOffset = 0;

      if (child.getAttribute('contenteditable') === 'false') {
        nodes.value.push(child);
      }
    });
  }

  // Reactive wrapper for Native Selection object
  selectionState.value = {
    ...sel,
    startIdx: startIdx, // relevant start idx of expanded mode
    endIdx: null // relevant end idx of expanded mode
  };
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

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.col-8 {
  flex: 0 0 66.666667%;
  max-width: 66.666667%;
}

.col-4 {
  flex: 0 0 33.333333%;
  max-width: 33.333333%;
}

.col-8 h3, .col-4 h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}

.instruction {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
  font-style: italic;
}

.editable-content {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  background: white;
  min-height: 150px;
  line-height: 1.6;
  font-size: 1.1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  outline: none;
  transition: box-shadow 0.2s;
}

.editable-content:focus {
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  border-color: #4299e1;
}

.editable-content span {
  padding: 2px 0;
}
</style>

<template>
  <div

    ref="rootRef"
    class="editable-content"
    contenteditable="true"
    @keydown="onKeyDown"
    @keyup="onKeyup"
    @mouseup="onMouseup"
  >
    <template v-for="(item, idx) in localNode.content" :key="idx">
      <NodeText v-if="'text' in item" :node="item as InlineText" />
      <span
        v-else
        contenteditable="false"
        class="atom-element"
      >
        {{ (item as InlineAtom).name }}
      </span>


    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, shallowReactive, shallowRef } from 'vue';
import type { PropType } from 'vue';
import { $BlockText, COMMON_MARK, type BlockText, type InlineAtom, type InlineText, type InlineType } from '../text-types';
import NodeText from './node-text.vue';
import CmdsText, { FlatContent } from '../cmds-basic';
import { KEY_MAPPING } from '../cmd-mapping';
import { SelectionState, TextSelection } from '../text-selection';
import { NinText } from '../nin-text';


export default defineComponent({
  name: 'BlockTextRender',
  components: { NodeText },
  props: {
    modelValue: Object as PropType<BlockText>,
  },
  emits: ['update:modelValue'],
  data(){
    return {
      localNode: undefined as BlockText | undefined,//shallowReactive({attr:{}, content:[]}),
      selState: markRaw({} as SelectionState),
      pKeyDown: '', // empty
    }
  },
  watch:{
    localNode: {
      deep: 1,
      handler(newVal){
        this.$emit('update:modelValue', this.localNode);
      }
    },

    modelValue:{
      immediate:true,
      handler(newVal){
        if(newVal === undefined || newVal !== this.localNode){
          this.localNode = shallowReactive($BlockText.sanitize(newVal));
        }
      }
    },
  },

  methods: {

    onMouseup() {
      console.log('#selection on mouse-up:', this.selState.selection.value);
      // if (this.selState) {
      //   FlatContent.expand(this.localNode.content).log(this.selState.selection.value.from, this.selState.selection.value.to);
      // }
    },

    onKeyup(e: KeyboardEvent) {
      this.pKeyDown = '';
    },
    onKeyDown(e: KeyboardEvent) {

      const keyStr = e.key;

      if(keyStr === 'Backspace'){ // backspace is special
          e.preventDefault();
          CmdsText.makeDeleteLeft()(this.localNode, this.selState);
          return;
      }

      if (keyStr.length > 1) {
         // we pass mod keys Ctrl/Alt/Shift to the dom
         return;
      }

      e.preventDefault();
      console.log('#Input Key Str:', keyStr, 'length:', keyStr.length, 'code-point:', keyStr.charCodeAt(0));

      if(this.pKeyDown){
        return;
      }

      this.pKeyDown += keyStr;

      console.log('#COMMON MARK', COMMON_MARK);

      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {

        let modKey = '';
        if (e.ctrlKey || e.metaKey) modKey += 'Ctrl+';

        if (e.altKey) modKey += 'Alt+';
        else if (e.shiftKey) modKey += 'Shift+';

        const fullKey = modKey + keyStr;
        const cmd = KEY_MAPPING[fullKey as keyof typeof KEY_MAPPING];
        if(!cmd) return;

        cmd(this.localNode, this.selState);
        return;
      }

      CmdsText.makeReplaceText(keyStr)(this.localNode, this.selState);

    },
    onSelectionChange() {
      this.selState.trackDomSelection(this.localNode.content);
    },
  },

  mounted() {
    this.selState = markRaw(new SelectionState(this.$refs.rootRef as HTMLElement));
    document.addEventListener('selectionchange', this.onSelectionChange);
  },
  beforeUnmount() {
    document.removeEventListener('selectionchange', this.onSelectionChange);
  },
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

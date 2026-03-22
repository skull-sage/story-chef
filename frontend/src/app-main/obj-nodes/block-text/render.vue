<template>
  <div
    ref="rootRef"
    class="editable-content"
    contenteditable="true"
    @mouseup="onMouseup"
    @keydown="onKeyDown"
    @keyup="onKeyup"
  ></div>
</template>

<script lang="ts">
import { defineComponent, markRaw, render, type PropType, getCurrentInstance } from 'vue';
import type { BlockText } from './text-types';
import { COMMON_MARK } from './text-types';
import NinState from './nin-state';
import CmdsText from './cmds-basic';
import { KEY_MAPPING } from './cmd-mapping';
import { renderContent, renderNode } from './render-block-text';

export default defineComponent({
  name: 'BlockTextRender',
  props: {
    modelValue: {
      type: Object as PropType<BlockText>,
      required: false
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      ninState: markRaw(null as NinState | null)
    };
  },
  mounted() {
    const rootEl = this.$refs.rootRef as HTMLElement;
    if (!rootEl) return;

    this.ninState = new NinState(rootEl, (dataNode)=>this.updateView(dataNode), (dataNode)=>this.$emit('update:modelValue', dataNode));
    if (this.modelValue) {
      this.ninState.setDataNode(this.modelValue);
    }
  },
  methods: {
    emitChange(dataNode:BlockText, adjustFrom?:number, adjustTo?:number) {
      this.updateView(dataNode);
      this.ninState.adjustDomSelection(dataNode.content, adjustFrom, adjustTo);
      this.$emit('update:modelValue', dataNode);
    },
    updateView(dataNode: BlockText) {
      const rootEl = this.$refs.rootRef as HTMLElement;
      if (!rootEl) return;

      if (!this.ninState) {
        return;
      }
      const appContext = this.$.appContext;
      const vnode = renderNode(dataNode, appContext);
      render(vnode, rootEl);
    },
    onMouseup() {
      this.ninState?.calcDomSelection();
    },
    onKeyup(e: KeyboardEvent) {
      this.ninState?.calcDomSelection();
    },
    onKeyDown(e: KeyboardEvent) {
      const keyStr = e.key;

      if (keyStr === 'Backspace') {
        e.preventDefault();
         this.ninState.delLeft();
        return;
      }

      if (keyStr.length > 1) {
        return; // pass mod keys Ctrl/Alt/Shift to the dom
      }

      e.preventDefault();
      console.log('#Input Key Str:', keyStr, 'length:', keyStr.length, 'code-point:', keyStr.charCodeAt(0));

      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        let modKey = '';
        if (e.ctrlKey || e.metaKey) modKey += 'Ctrl+';
        if (e.altKey) modKey += 'Alt+';
        else if (e.shiftKey) modKey += 'Shift+';
        const fullKey = modKey + keyStr;
        console.log("[.] FullKey", fullKey);
        return;
      }

      this.ninState.replaceText(keyStr);
    }
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

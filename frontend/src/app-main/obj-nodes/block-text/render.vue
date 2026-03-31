<template>
  <div ref="rootRef" class="editable-content"
    contenteditable="true"
    @mouseup="onMouseup"
    @focus="redirectSelection"
    @click="redirectSelection"
  ></div>
</template>

<script lang="ts">
import { defineComponent, markRaw, render, type PropType, getCurrentInstance, shallowRef } from 'vue';
import type { BlockText } from './text-types';
import NinStore from './nin-store';
import { renderNode } from './render-block-text';
import { TextSelection } from 'prosemirror-state';
import { KeyBinding } from './binding-keyinput';
import bindMutation from './binding-mutation';
import bindCharMutation from './binding-mutation';

export default defineComponent({
  name: 'BlockTextRender',
  props: {
    modelValue: {
      type: Object as PropType<BlockText>,
      required: false
    }
  },
  emits: ['update:model-value'],
  data() {
    return {
      ninStore: undefined,
      selection: shallowRef<TextSelection>(null),
      mutationBinding: undefined,
      keyBinding: undefined,
    };
  },
  mounted() {
    const rootEl = this.$refs.rootRef as HTMLElement;
    if (!rootEl) return;

    const ninStore = new NinStore(rootEl, {
      updateView: (dataNode) => this.updateView(dataNode),
      emitChange: (dataNode) => this.$emit('update:model-value', dataNode),
      updateSelection: (selection) => this.selection = selection
    });
    this.ninStore = markRaw(ninStore);

    this.keyBinding = new KeyBinding(ninStore);
    this.mutationBinding = bindCharMutation(ninStore);

    this.ninStore.setDataNode(this.modelValue);

  },
  beforeUnmount() {
    this.keyBinding.unmount();
    this.mutationBinding.unmount();
  },
  methods: {

    updateView(dataNode: BlockText) {
      const rootEl = this.$refs.rootRef as HTMLElement;
      if (!rootEl) return;

      if (!this.ninStore) {
        return;
      }
      const appContext = this.$.appContext;
      const vnode = renderNode(dataNode, appContext);
      render(vnode, rootEl);
    },
    redirectSelection() {
      const rootEl = this.$refs.rootRef as HTMLElement;
      if (!rootEl) return;
      const sel = window.getSelection();
      if (!sel) return;

      if (sel.anchorNode === rootEl || sel.focusNode === rootEl) {
        let target: Node = rootEl.firstElementChild as Node;
        if (target) {
          while (target.firstChild) {
            target = target.firstChild;
          }
          sel.collapse(target, 0);
        }
      }
    },
    onMouseup() {
      this.redirectSelection();
      this.ninStore?.calcDomSelection();
    },

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
  min-height: auto;
  position: relative;
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
}

.editable-content:first-child{
  min-width: 100%;
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

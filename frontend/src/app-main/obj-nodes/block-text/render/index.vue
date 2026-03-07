<template>
  <div
    ref="rootRef"
    class="editable-content"
    contenteditable="true"
    @keydown="onKeydown"
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
import { defineComponent, shallowReactive, shallowRef } from 'vue';
import type { PropType } from 'vue';
import { $BlockText, type BlockText, type InlineAtom, type InlineText, type InlineType } from '../text-types';
import NodeText from './node-text.vue';
import { calcTextLocalSelection, type TextSelection } from '../text-selection';
import CmdsText, { FlatContent } from '../cmds-basic';
import { KEY_MAPPING } from '../cmd-mapping';


export default defineComponent({
  name: 'BlockTextRender',
  components: { NodeText },
  props: {
    modelValue: { type: Object as PropType<BlockText>, required: true },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      localNode: shallowRef($BlockText.sanitize(this.modelValue)),
      selectionState: undefined as TextSelection | undefined,

    };
  },
  watch: {
    localNode: {
      deep: 1,
      handler(newVal) {
        this.$emit('update:modelValue', newVal);
      }
    },
    modelValue(newVal) {
      if (newVal === this.localNode) return;
      this.localNode = shallowReactive($BlockText.sanitize(newVal));
    }
  },

  methods: {
    onSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        this.selectionState = undefined;
        return;
      }
      const root = this.$refs.rootRef as HTMLElement | null;
      this.selectionState = calcTextLocalSelection(sel, root, this.localNode);
    },
    onMouseup() {
      console.log('#selection on mouse-up:', this.selectionState);
      if (this.selectionState) {
        FlatContent.expand(this.localNode.content).log(this.selectionState.from, this.selectionState.to);
      }
    },
    onKeydown(e: KeyboardEvent) {
      let keyStr = e.key;
      if (e.ctrlKey && keyStr !== 'Control') {
        keyStr = `Ctrl+${keyStr.toLowerCase()}`;
        const cmd = KEY_MAPPING[keyStr as keyof typeof KEY_MAPPING];
        if (cmd) {
          e.preventDefault();
          const sel = this.selectionState;
          if (!sel) return;
          cmd(this.localNode, sel);
          return;
        }
      } else {
        e.preventDefault();
        const sel = this.selectionState;
        if (!sel) return;
        CmdsText.makeReplaceText(e.key)(this.localNode, sel);
        return;
      }
    },
  },
  mounted() {
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

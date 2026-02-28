<template>
  <div
    ref="rootRef"
    class="editable-content"
    contenteditable="true"
    @keydown="onKeydown"
    @mouseup="onMouseup"
  >
    <template v-for="(item, idx) in node.content" :key="idx">
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
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { BlockText, InlineAtom, InlineText, InlineType } from '../text-types';
import NodeText from './node-text.vue';
import { calcTextLocalSelection, type TextSelection } from '../text-selection';
import CmdsText, { FlatContent } from '../cmds-basic';
import { markForKey } from '../keybindings';


export default defineComponent({
  name: 'BlockTextRender',
  components: { NodeText },
  props: {
    node: { type: Object as PropType<BlockText>, required: true },
  },
  data() {
    return {
      selectionState: undefined as TextSelection | undefined,
    };
  },
  methods: {
    onSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        this.selectionState = undefined;
        return;
      }
      const root = this.$refs.rootRef as HTMLElement | null;
      this.selectionState = calcTextLocalSelection(sel, root, this.node);
    },
    onMouseup() {
      console.log('#selection on mouse-up:', this.selectionState);
      if (this.selectionState) {
        FlatContent.expand(this.node.content).log(this.selectionState.from, this.selectionState.to);
      }
    },
    onKeydown(e: KeyboardEvent) {
      // Ctrl+V — paste clipboard as plain text
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        const sel = this.selectionState;
        if (!sel) return;
        navigator.clipboard.readText().then((raw) => {
          if (!raw) return;
          CmdsText.replaceText(this.node, sel, raw);
        });
        return;
      }

      // Mark shortcuts (bold, italic, etc.)
      const mark = markForKey(e);
      if (mark) {
        e.preventDefault();
        console.log(e, mark);
        const sel = this.selectionState;
        if (!sel) return;
        CmdsText.applyMark(this.node, mark, sel);
        return;
      }

      // Backspace — delete selection or char before cursor
      if (e.key === 'Backspace') {
        e.preventDefault();
        const sel = this.selectionState;
        if (!sel) return;
        if (sel.from === sel.to) {
          if (sel.from === 0) return;
          CmdsText.replaceText(this.node, { ...sel, from: sel.from - 1 }, '');
        } else {
          CmdsText.replaceText(this.node, sel, '');
        }
        return;
      }

      // Delete — delete selection or char after cursor
      if (e.key === 'Delete') {
        e.preventDefault();
        const sel = this.selectionState;
        if (!sel) return;
        if (sel.from === sel.to) {
          CmdsText.replaceText(this.node, '', { ...sel, to: sel.to + 1 });
        } else {
          CmdsText.replaceText(this.node, '', sel);
        }
        return;
      }

      // Printable character — insert/overwrite at selection
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const sel = this.selectionState;
        if (!sel) return;
        CmdsText.replaceText(this.node, e.key, sel);
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

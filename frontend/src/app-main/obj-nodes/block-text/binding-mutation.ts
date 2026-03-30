import { onMounted, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import NinState from './nin-store';
import CmdsText from './cmds-text';
import { BlockText, COMMON_MARK } from './text-types';
import { KEY_MAPPING } from './cmd-mapping';


const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta']);
const IGNORED_SOLO_KEYS = new Set([...MODIFIER_KEYS, 'Backspace']);

export class MutationBinding {
  ninState: NinState;
  mutationObserver: MutationObserver;
  onKeyDown: (e: KeyboardEvent) => void;

  constructor(ninState: NinState) {
    this.ninState = ninState;
    this.mutationObserver = new MutationObserver((mutations) => {
      this.#handleMutation(mutations);
      this.#resetDomSelection();
    });
    this.onKeyDown = (e: KeyboardEvent) => {
      this.#handleKeyDown(e);
    };


  }

  #resetDomSelection() {
    const sel = window.getSelection();
    if (!sel) return;
    const range = sel.getRangeAt(0);
    const newRange = document.createRange();
    newRange.selectNodeContents(this.ninState.elm.firstElementChild as HTMLElement);
    newRange.setStart(range.startContainer, range.startOffset);
    newRange.setEnd(range.endContainer, range.endOffset);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  #handleMutation(mutations: MutationRecord[]) {
    let { elm, dataNode, emitChange } = this.ninState;
    const rootBlock = elm.firstElementChild;
    if (!rootBlock) return;

    let isModified = false;
    for (const mutation of mutations) {
      if (mutation.type !== 'characterData') {
        throw new Error('Mutation type is not characterData');
      }

      isModified = this.#mapMutationTargetToInlineItem(mutation.target, dataNode, elm);

    }
    if (isModified) {
      emitChange(dataNode);
    }

  }


  #mapMutationTargetToInlineItem(target: Node, dataNode: BlockText, rootNode: HTMLElement): boolean {
    let targetIdx = undefined;
    for (let idx = 0; idx < rootNode.childNodes.length; idx++) {
      if (rootNode.childNodes[idx].contains(target)) {
        targetIdx = idx;
        break;
      }
    }

    if (targetIdx) {
      const item = dataNode.content[targetIdx];
      if ('text' in item) {
        item.text = target.textContent || '';
        return true;
      }
    }
    return false;


  }


  #handleKeyDown(e: KeyboardEvent) {
    e.preventDefault();
    const key = e.key;
    const hasModifier = e.ctrlKey || e.altKey || e.metaKey;

    // Ignore lone modifier / Backspace presses
    if (IGNORED_SOLO_KEYS.has(key)) return;

    // Modifier + key combo  (Ctrl+A, Ctrl+Shift+Z, etc.)
    if (hasModifier) {
      const parts: string[] = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      if (e.metaKey) parts.push('Meta');
      parts.push(key);
      console.log('Key input:', parts.join('+'));
      return;
    }

    // Single printable character (length === 1 covers letters, digits, symbols)
    if (key.length === 1) {
      console.log('Char input:', key);
    }
  }

  mount() {
    this.ninState.elm.addEventListener('keydown', this.onKeyDown);
    this.mutationObserver.observe(this.ninState.elm, {
      //childList: true,
      subtree: true,
      characterData: true,
    });
  }

  unmount() {
    this.ninState.elm.removeEventListener('keydown', this.onKeyDown);
    this.mutationObserver.disconnect();
  }
}

import { onMounted, onBeforeUnmount, markRaw } from 'vue';
import type { Ref } from 'vue';
import NinStore from './nin-store';
import CmdsText from './cmds-text';
import { BlockText, COMMON_MARK } from './text-types';
import { KEY_MAPPING } from './cmd-mapping';


const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta']);
const IGNORED_SOLO_KEYS = new Set([...MODIFIER_KEYS, 'Backspace']);


function _handleMutation(mutations: MutationRecord[], ninStore: NinStore) {
  let { elm, dataNode, emitChange } = ninStore;
  const rootBlock = elm.firstElementChild;
  if (!rootBlock) return;

  let isModified = false;
  console.log('### mutations', mutations);
  for (const mutation of mutations) {
    if (mutation.type !== 'characterData') {
      throw new Error('Mutation type is not characterData');
    }
    isModified = mapMutationTargetToInlineItem(mutation.target, dataNode, elm);
  }

  console.log('isModified', isModified);
  if (isModified) {
    emitChange(dataNode);
  }
}

function mapMutationTargetToInlineItem(target: Node, dataNode: BlockText, rootNode: HTMLElement): boolean {
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


function _resetDomSelection(targetElm: HTMLElement) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = sel.getRangeAt(0);
  const newRange = document.createRange();
  newRange.selectNodeContents(targetElm);
  newRange.setStart(range.startContainer, range.startOffset);
  newRange.setEnd(range.endContainer, range.endOffset);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

export default function bindMutation(ninStore: NinStore) {
  const mutationObserver = new MutationObserver((mutations) => {
    _handleMutation(mutations, ninStore);
    _resetDomSelection(ninStore.elm.firstElementChild as HTMLElement);
  });

  mutationObserver.observe(ninStore.elm, {
    //childList: true,
    subtree: true,
    characterData: true,
  });

  return markRaw(mutationObserver);
}


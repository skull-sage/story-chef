import { InlineText, InlineAtom, InlineItem, isMarkEqual, MarkType, TextNodeAttr } from "./text-types"
import { BlockText } from "./text-types"
import { TextSelection } from "./text-selection"
import { nextTick } from "process";
import NinStore from "./nin-store";
import { FlatContent } from "./flat-content";


function replaceText(ninStore: NinStore, text: string) {
  const { from, to, mark, start, end } = ninStore.selection;


  const adjPos = from + text.length; // for empty content from == 0

  // selection start and end is within same InlineText
  if (ninStore.dataNode.content.length == 0) {
    const content = [{ text: text, mark: mark }];
    ninStore.$patchContent(content, adjPos, adjPos);
    return;
  }


  // selection is within a single InlineText
  if (start.inlineIdx == end.inlineIdx && 'text' in ninStore.dataNode.content[start.inlineIdx]) {
    ninStore.$patchInline(start.inlineIdx, start.offset, end.offset, text, adjPos);
    return;
  }

  // selection expands to multiple inline items
  const flatContent = FlatContent.expand(ninStore.dataNode.content);
  const newContent = flatContent.replaceText(from, to, text, mark);
  ninStore.$patchContent(newContent, adjPos, adjPos);
}


export default {
  // make prefix means we are creating functions that return
  // command (node, selection) => {mutation logic here}

  makeReplaceText: (text: string) => (ninStore: NinStore) => {
    replaceText(ninStore, text);
  },

  makeClipboardPaste: () => (ninStore: NinStore) => {
    navigator.clipboard.readText().then((raw) => {
      if (!raw) return;
      replaceText(ninStore, raw);
    });
  },

  makeInsertAtom: (atom: InlineAtom) => (ninStore: NinStore) => {
    console.warn("makeInsertAtom is not implemented yet");
  },

  makeDeleteLeft: () => (ninStore: NinStore) => {
    const { from, to, start, end } = ninStore.selection;
    if (from == 0 && to == 0) return; // this also solves content == []

    const adjPos = (from == to) ? from - 1 : from;
    // selection is within a single InlineText
    if (start.inlineIdx == end.inlineIdx && 'text' in ninStore.dataNode.content[start.inlineIdx]) {
      let startOffset = start.offset == end.offset ? start.offset - 1 : start.offset;
      ninStore.$patchInline(start.inlineIdx, startOffset, end.offset, '', adjPos);
      return;
    }

    const flatContent = FlatContent.expand(ninStore.dataNode.content);
    const newContent = flatContent.replaceText(from, to, '', undefined);
    ninStore.$patchContent(newContent, adjPos, adjPos);

  },

  makeApplyMark: (mark: MarkType) => (ninState: NinStore) => {
    const { from, to, mark: selMark } = ninState.selection;
    if (to - from == 0) return; // if there is a selection or cursor is at the start, do nothing
    const flatContent = FlatContent.expand(ninState.dataNode.content);
    let toApply = selMark && isMarkEqual(selMark, mark) ? undefined : mark;
    const newContent = flatContent.applyMark(from, to, toApply);
    ninState.$patchContent(newContent, from, to);
  },

  makeApplyAttr: (attr: TextNodeAttr) => (ninState: NinStore) => {
    ninState.$patchAttr(attr);
  }

}



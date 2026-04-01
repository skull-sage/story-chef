import { InlineText, InlineAtom, InlineItem, isMarkEqual, MarkType, TextNodeAttr } from "./text-types"
import { BlockText } from "./text-types"
import { TextSelection } from "./text-selection"
import { nextTick } from "process";
import NinStore from "./nin-store";
import { FlatContent } from "./flat-content";





export default {
  // make prefix means we are creating functions that return
  // command (node, selection) => {mutation logic here}

  makeReplaceText: (text: string) => (ninState: NinStore) => {
    ninState.$replaceTextAtSelection(text);
  },

  makeClipboardPaste: () => (ninState: NinStore) => {
    navigator.clipboard.readText().then((raw) => {
      if (!raw) return;
      ninState.$replaceTextAtSelection(raw);
    });
  },

  makeInsertAtom: (atom: InlineAtom) => (ninState: NinStore) => {
    console.warn("makeInsertAtom is not implemented yet");
  },

  makeDeleteLeft: () => (ninState: NinStore) => {
    const { from, to, mark } = ninState.selection;
    if (to - from == 0) return; // if there is a selection or cursor is at the start, do nothing

    const flatContent = FlatContent.expand(ninState.dataNode.content);
    const newContent = flatContent.replaceText(from, to, '', mark);
    ninState.$patchContent(newContent, from, from);

    /*
    delete with Caret selection  are left for handling mutation observer:
       ninState.dataNode.content = flatContent.replaceText(from - 1, to, '', mark);
      ninState.adjustDomSelection(ninState.dataNode.content, from - 1, from - 1);
    */

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



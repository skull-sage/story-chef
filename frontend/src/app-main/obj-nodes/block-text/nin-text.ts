import { $BlockText, BlockText, InlineType, MarkType, TextAttr } from "./text-types";
import { adjustTextLocalSelection, calcFromDomSelection, TextSelection } from "./text-selection";
import { nextTick } from "process";
import { ShallowReactive, shallowRef, ShallowRef } from "vue";

export class NinText {

  dataNode: BlockText;
  elm: HTMLElement;
  selection: ShallowRef<TextSelection>;
  domSelection: Selection;

  emitChange: (node: BlockText) => void;

  constructor(node: BlockText, elm: HTMLElement, emitChange: (node: BlockText) => void) {
    this.dataNode = $BlockText.sanitize(node);
    this.elm = elm;
    this.selection = shallowRef({ from: 0, to: 0, mark: undefined });
    this.domSelection = window.getSelection()!;
    this.emitChange = emitChange;
  }

  $patchContent(content: InlineType[], adjustFrom: number, adjustTo: number) {
    this.dataNode.content = content;
    this.domSelection.removeAllRanges();
    this.emitChange(this.dataNode);
    nextTick(() => {
      adjustTextLocalSelection(this.elm, content, adjustFrom, adjustTo);
    });
  }

  $patchAttr(attrs: TextAttr) {
    for (const key in attrs) {
      this.dataNode.attrs[key] = attrs[key];
    }
    this.emitChange(this.dataNode);
  }

  trackDomSelection() {
    this.selection.value = calcFromDomSelection(this.elm, this.dataNode.content);
  }




}

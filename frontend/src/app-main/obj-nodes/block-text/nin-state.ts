import { $BlockText, BlockText, InlineItem, MarkType, TextAttr } from "./text-types";
import { adjustTextLocalSelection, calcFromDomSelection, TextSelection } from "./text-selection";
import { nextTick } from "process";
import { shallowRef, ShallowRef } from "vue";

export default class NinState {

  dataNode: BlockText;
  elm: HTMLElement;
  selState: ShallowRef<TextSelection>;
  domSelection: Selection;
  renderKey: number;
  updateView: (node: BlockText) => void;
  emitChange: (node: BlockText) => void;

  constructor(elm: HTMLElement, updateView: (node: BlockText) => void, emitChange: (node: BlockText) => void) {

    this.elm = elm;
    this.selState = shallowRef({ from: 0, to: 0, mark: undefined });
    this.domSelection = window.getSelection()!;
    this.updateView = updateView;
    this.emitChange = emitChange;
    this.renderKey = 0;
  }

  setDataNode(node: BlockText) {
    this.dataNode = $BlockText.sanitize(node);
    this.emitChange(this.dataNode);

  }

  trackDomCharMutation(target: Node) {

  }

  trackDomNodeMutation(target: Node) {

  }

  selection(): TextSelection {
    return this.selState.value;
  }

  calcDomSelection() {
    this.selState.value = calcFromDomSelection(this.elm, this.dataNode.content);

  }

  adjustDomSelection(content: InlineItem[], adjustFrom: number, adjustTo: number) {
    adjustTextLocalSelection(this.elm, content, adjustFrom, adjustTo);
  }



  $patchContent(content: InlineItem[], adjustFrom: number, adjustTo: number) {
    this.dataNode.content = content;
    this.domSelection.removeAllRanges();
    this.emitChange(this.dataNode);
    this.renderKey++;
    nextTick(() => {
      adjustTextLocalSelection(this.elm, content, adjustFrom, adjustTo);
    });
  }


  // $patchAttr(attrs: TextAttr) {
  //   for (const key in attrs) {
  //     this.dataNode.attrs[key] = attrs[key];
  //   }
  //   this.emitChange(this.dataNode);
  //   this.renderKey++;
  // }


}

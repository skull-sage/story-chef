import { $BlockText, BlockText, InlineItem, MarkType, TextAttr } from "./text-types";
import { adjustTextLocalSelection, calcFromDomSelection, TextSelection } from "./text-selection";
import { nextTick } from "process";
import { shallowRef, ShallowRef } from "vue";

export default class NinState {

  dataNode: BlockText;
  elm: HTMLElement;
  selection: TextSelection;
  domSelection: Selection;

  updateView: (node: BlockText) => void;
  emitChange: (node: BlockText) => void;
  updateSelection: (selection: TextSelection) => void;

  constructor(elm: HTMLElement, updateView: (node: BlockText) => void, emitChange: (node: BlockText) => void, updateSelection: (selection: TextSelection) => void) {

    this.elm = elm;
    this.selection = { from: 0, to: 0, mark: undefined };
    this.domSelection = window.getSelection()!;
    
    this.updateView = updateView;
    this.emitChange = emitChange;
    this.updateSelection = updateSelection;
  }

  setDataNode(node: BlockText) {
    this.dataNode = $BlockText.sanitize(node);
    this.emitChange(this.dataNode);

  }

  trackDomCharMutation(target: Node) {

  }

  trackDomNodeMutation(target: Node) {

  }

  calcDomSelection() {
    this.selection = calcFromDomSelection(this.elm, this.dataNode.content);

  }

  adjustDomSelection(content: InlineItem[], adjustFrom: number, adjustTo: number) {
    adjustTextLocalSelection(this.elm, content, adjustFrom, adjustTo);
  }



  $patchContent(content: InlineItem[], adjustFrom: number, adjustTo: number) {
    this.dataNode.content = content;
    this.updateView(this.dataNode);
    this.domSelection.removeAllRanges();
    adjustTextLocalSelection(this.elm, content, adjustFrom, adjustTo);
    this.emitChange(this.dataNode);
  }


  // $patchAttr(attrs: TextAttr) {
  //   for (const key in attrs) {
  //     this.dataNode.attrs[key] = attrs[key];
  //   }
  //   this.emitChange(this.dataNode);
  //   this.renderKey++;
  // }


}

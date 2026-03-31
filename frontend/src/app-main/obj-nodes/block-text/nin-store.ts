import { $BlockText, BlockText, InlineItem, MarkType, TextNodeAttr } from "./text-types";
import { adjustTextLocalSelection, calcFromDomSelection, TextSelection } from "./text-selection";
import { nextTick } from "process";
import { shallowRef, ShallowRef } from "vue";

export default class NinStore {

  dataNode: BlockText;
  selection?: TextSelection;

  elm: HTMLElement;
  updateView: (node: BlockText) => void;
  emitChange: (node: BlockText) => void;
  updateSelection: (selection: TextSelection) => void;

  constructor(elm: HTMLElement, { updateView, emitChange, updateSelection }: { updateView: (node: BlockText) => void, emitChange: (node: BlockText) => void, updateSelection: (selection: TextSelection) => void }) {

    this.elm = elm;
    this.selection = { from: 0, to: 0, mark: undefined, isCollapsed: true };
    this.updateView = updateView;
    this.emitChange = emitChange;
    this.updateSelection = updateSelection;
  }

  setDataNode(node: BlockText) {
    this.dataNode = $BlockText.sanitize(node);
    this.emitChange(this.dataNode);
    this.updateView(this.dataNode);

  }


  calcDomSelection(): TextSelection {
    const sel = calcFromDomSelection(this.elm.firstElementChild as HTMLElement, this.dataNode.content);
    this.selection = sel;
    this.updateSelection(sel);
    return sel;
  }

  adjustDomSelection(content: InlineItem[], adjustFrom: number, adjustTo: number) {
    adjustTextLocalSelection(this.elm.firstElementChild as HTMLElement, content, adjustFrom, adjustTo);
  }

  nodeContentEmpty() {
    return this.dataNode.content.length === 0;
  }

  $patchContent(content: InlineItem[], adjustFrom: number, adjustTo: number) {
    nextTick(() => {
      this.dataNode.content = content;
      this.updateView(this.dataNode);
      window.getSelection().removeAllRanges();
      adjustTextLocalSelection(this.elm.firstElementChild as HTMLElement, content, adjustFrom, adjustTo);
      this.emitChange(this.dataNode);
    });
  }


  $patchAttr(attrs: TextNodeAttr) {
    for (const key in attrs) {
      this.dataNode.attrs[key] = attrs[key];
    }
    this.emitChange(this.dataNode);
  }


}

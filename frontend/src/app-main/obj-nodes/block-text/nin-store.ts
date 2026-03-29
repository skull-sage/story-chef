import { $BlockText, BlockText, InlineItem, MarkType, TextAttr } from "./text-types";
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

  }


  calcDomSelection() {
    this.selection = calcFromDomSelection(this.elm.firstElementChild as HTMLElement, this.dataNode.content);
    this.updateSelection(this.selection);
  }

  adjustDomSelection(content: InlineItem[], adjustFrom: number, adjustTo: number) {
    adjustTextLocalSelection(this.elm.firstElementChild as HTMLElement, content, adjustFrom, adjustTo);
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

  // mainly character mutation with caret/collapsed selection
  $patchMutation(mutations: MutationRecord[]) {
    const rootBlock = this.elm.firstElementChild;
    if (!rootBlock) return;

    let isModified = false;
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        const textNode = mutation.target;
        const inlineElement = textNode.parentElement;

        if (inlineElement) {
          const index = Array.from(rootBlock.childNodes).indexOf(inlineElement);

          if (index !== -1 && index < this.dataNode.content.length) {
            const item = this.dataNode.content[index];
            if ('text' in item) {
              item.text = textNode.textContent || '';
              isModified = true;
            }
          }
        }
      }
    }

    if (isModified) {
      this.emitChange(this.dataNode);
    }
  }


  // $patchAttr(attrs: TextAttr) {
  //   for (const key in attrs) {
  //     this.dataNode.attrs[key] = attrs[key];
  //   }
  //   this.emitChange(this.dataNode);
  //   this.renderKey++;
  // }


}

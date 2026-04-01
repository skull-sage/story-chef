import { $BlockText, BlockText, InlineItem, InlineText, MarkType, TextNodeAttr } from "./text-types";
import { adjustTextLocalSelection, calcFromDomSelection, TextSelection } from "./text-selection";
import { nextTick } from "process";
import { AppContext, shallowRef, ShallowRef } from "vue";
import { renderNode } from "./render-block-text";
import { FlatContent } from "./flat-content";

export default class NinStore {

  dataNode: BlockText;
  selection?: TextSelection;

  rootElm: HTMLElement;
  appContext: AppContext;
  emitChange: (node: BlockText) => void;
  updateSelection: (selection: TextSelection) => void;

  constructor(rootElm: HTMLElement, appContext: AppContext, { emitChange, updateSelection }: { emitChange: (node: BlockText) => void, updateSelection: (selection: TextSelection) => void }) {

    this.rootElm = rootElm;
    this.appContext = appContext;
    this.selection = { from: 0, to: 0, mark: undefined, isCollapsed: true };
    this.emitChange = emitChange;
    this.updateSelection = updateSelection;
  }

  setDataNode(node: BlockText) {
    this.dataNode = $BlockText.sanitize(node);
    queueMicrotask(() => {
      this.emitChange(this.dataNode);
      renderNode(this.dataNode, this.rootElm, this.appContext);

    })

  }


  calcDomSelection(): TextSelection {
    const sel = calcFromDomSelection(this.rootElm.firstElementChild as HTMLElement, this.dataNode.content);
    this.selection = sel;
    this.updateSelection(sel);
    return sel;
  }

  adjustDomSelection(content: InlineItem[], adjustFrom: number, adjustTo: number) {
    adjustTextLocalSelection(this.rootElm.firstElementChild as HTMLElement, content, adjustFrom, adjustTo);
  }


  $patchInline(inlineIdx: number, startOffset: number, endOffset: number, text: string, adjustPos: number) {
    const item = this.dataNode.content[inlineIdx] as InlineText;


    const newText = item.text.slice(0, startOffset) + text + item.text.slice(endOffset);
    const containerElm = this.rootElm.firstChild as HTMLElement;
    const itemElm = containerElm.childNodes[inlineIdx];

    queueMicrotask(() => {
      if (newText) {
        this.dataNode.content[inlineIdx] = { text: newText, mark: item.mark };
        itemElm.textContent = newText;
      } else {
        this.dataNode.content.splice(inlineIdx, 1);
        if (this.dataNode.content.length == 0) {
          renderNode(this.dataNode, this.rootElm, this.appContext);
        } else {
          itemElm.remove();
        }
      }
      this.emitChange(this.dataNode);
      window.getSelection().removeAllRanges();
      adjustTextLocalSelection(containerElm, this.dataNode.content, adjustPos, adjustPos);
      //debugger;
    });
  }



  $patchContent(content: InlineItem[], adjustFrom: number, adjustTo: number) {
    queueMicrotask(() => {

      this.dataNode.content = content;
      renderNode(this.dataNode, this.rootElm, this.appContext);
      window.getSelection().removeAllRanges();
      adjustTextLocalSelection(this.rootElm.firstElementChild as HTMLElement, content, adjustFrom, adjustTo);
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

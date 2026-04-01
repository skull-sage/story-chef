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


  $replaceTextAtSelection(text: string) {
    const { from, to, mark, start, end } = this.selection;
    const content = this.dataNode.content;
    // selection start and end is within same InlineText
    if (content.length == 0 && text) {
      content.push({
        text: text,
        mark: mark
      });
      this.$patchContent(content, 0, text.length);
      return;
    }



    const adjPos = from + text.length;
    if (start.inlineIdx == end.inlineIdx && 'text' in content[start.inlineIdx]) {
      const item = content[start.inlineIdx] as InlineText;
      const newText = item.text.slice(0, start.offset) + text + item.text.slice(end.offset);
      content[start.inlineIdx] = { text: newText, mark: mark };
      const containerElm = this.rootElm.firstChild as HTMLElement;
      const itemElm = containerElm.childNodes[start.inlineIdx];
      queueMicrotask(() => {
        this.emitChange(this.dataNode);
        if (newText) itemElm.textContent = newText;
        else itemElm.remove();
        window.getSelection().removeAllRanges();
        adjustTextLocalSelection(containerElm, content, adjPos, adjPos);
      });
      return;
    }

    // selection expands to multiple inline items
    const flatContent = FlatContent.expand(content);
    const newContent = flatContent.replaceText(from, to, text, mark);
    this.$patchContent(newContent, adjPos, adjPos);
  }



  $patchContent(content: InlineItem[], adjustFrom: number, adjustTo: number) {

    this.dataNode.content = content;
    queueMicrotask(() => {
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

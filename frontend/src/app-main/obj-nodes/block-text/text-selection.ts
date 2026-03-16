
import { nextTick } from "process";
import { $BlockText, BlockText, InlineText, InlineType, MarkType } from "./text-types";



export type BlockRangeSelection = {
  start: { blockId: number | string, from: number },
  end: { blockId: number | string, to: number },
  mark: MarkType,
}


// Helper type for selection state
export class TextSelection {
  //start: InlineSelection; // kept for future reference
  //end: InlineSelection;
  from: number = 0;
  to: number = 0;
  mark: MarkType = undefined;
  focusXY?: { x: number; y: number } | null;

  // below inline selection info are only for debugging purpose
  start: { inlineIdx: number, offset: number } = undefined
  end: { inlineIdx: number, offset: number } = undefined
  refElm: HTMLElement;

  constructor(refElm: HTMLElement) {
    this.refElm = refElm;
  }

  trackDomSelection({ content }: BlockText) {
    const sel = window.getSelection();
    const validSel = sel && this.refElm.contains(sel.anchorNode) && this.refElm.contains(sel.focusNode);
    if (!validSel) return;
    let { startContainer, startOffset, endContainer, endOffset } = sel.getRangeAt(0);

    let prefixLen = 0;
    const domChildren = this.refElm.children;

    // this loop won't run if node.content is empty
    // html renders each item {InlineText, InlineAtom} wrapped in span tag
    for (let idx = 0; idx < content.length; idx++) {
      if (domChildren[idx].contains(startContainer)) {
        this.start = { inlineIdx: idx, offset: startOffset };
        this.from = prefixLen + startOffset;

      }
      if (domChildren[idx].contains(endContainer)) {
        this.end = { inlineIdx: idx, offset: endOffset };
        this.to = prefixLen + endOffset;
        break;
      }

      let item = content[idx]
      prefixLen += $BlockText.itemLength(item)

    }


    if (this.start && this.end && this.start.inlineIdx == this.end.inlineIdx) {
      const item = content[this.start.inlineIdx];
      if ($BlockText.isTextItem(item)) {
        this.mark = (item as InlineText).mark;
      }
    }

    console.log('# CALC selection', this.from, this.to, this.mark);
  }

  adjustDomSelection({ content }: BlockText, from: number, to: number) {
    nextTick(() => {
      adjustTextLocalSelection(this.refElm, from, to);
    });
  }

}




const calcFocusPos = (sel: Selection) => {
  let focusXY = null;
  if (sel.focusNode) {
    const targetElement = sel.focusNode.nodeType === Node.TEXT_NODE
      ? (sel.focusNode.parentElement as Element)
      : (sel.focusNode as Element);

    if (targetElement && targetElement.getBoundingClientRect) {
      const rect = targetElement.getBoundingClientRect();
      focusXY = { x: rect.left, y: rect.top };
    }
  }
  return focusXY;
}


export function adjustTextLocalSelection(elm: HTMLElement, from: number, to: number) {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();
  //range.setStart(elm, 0);
  //range.setEnd(elm, 0);


  const children = elm.children;
  let prefixLen = 0;

  let idx = 0;
  while (idx < children.length) {
    const child = children[idx] as HTMLElement;
    let cLen;
    if (child.isContentEditable) {
      const textNode = child.firstChild as Node;
      cLen = textNode.textContent?.length || 0;
    } else {
      cLen = 1;
    }

    if (from >= prefixLen && from <= prefixLen + cLen) {
      range.setStart(child, from - prefixLen);
      break;
    }
    prefixLen += cLen;
    idx++;
  }

  while (idx < children.length) {
    const child = children[idx] as HTMLElement;
    const cLen = child.isContentEditable ? (child.textContent?.length || 0) : 1;

    if (to >= prefixLen && to <= prefixLen + cLen) {
      range.setEnd(child, to - prefixLen);
      break;
    }
    prefixLen += cLen;
    idx++;
  }

  sel.removeAllRanges();
  sel.addRange(range);
  debugger;
}



import { nextTick } from "process";
import { $BlockText, BlockText, InlineText, InlineType, MarkType } from "./text-types";
import { shallowRef, ShallowRef } from "vue";



export type BlockRangeSelection = {
  start: { blockId: number | string, from: number },
  end: { blockId: number | string, to: number },
  mark: MarkType,
}

export type InlineSelection = {
  inlineIdx: number;
  offset: number;
  isText: Boolean;
}

export type TextSelection = {
  from: number;
  to: number;
  mark: MarkType;
  focusXY?: { x: number; y: number } | null;
  start?: InlineSelection;
  end?: InlineSelection;
}

export class SelectionState {
  selection: ShallowRef<TextSelection>;
  domSelection: Selection;
  elm: HTMLElement;

  constructor(elm: HTMLElement) {
    this.elm = elm;
    this.selection = shallowRef({ from: 0, to: 0, mark: undefined });
    this.domSelection = window.getSelection()!;
  }

  trackDomSelection(content: InlineType[]) {
    //console.log("## tracking dom selection for content: ", content);
    this.selection.value = calcFromDomSelection(this.elm, content);
    //console.log("## after tracking: calcFromDomSelection: ", this.selection.value);
  }



  adjustDomSelection(content: InlineType[], from: number, to: number) {
    // console.log("## adjusting dom selection:", from, to);

    //adjustTextLocalSelection(this.elm, content, from, to);

    this.domSelection.removeAllRanges();
    nextTick(() => {
      adjustTextLocalSelection(this.elm, content, from, to)
    });
  }
}


export function calcFromDomSelection(elm: HTMLElement, content: InlineType[]): TextSelection {
  const sel = window.getSelection();
  const validSel = sel && elm.contains(sel.anchorNode) && elm.contains(sel.focusNode);
  if (!validSel) return;
  let { startContainer, startOffset, endContainer, endOffset } = sel.getRangeAt(0);

  let prefixLen = 0;
  let from = 0, to = 0;
  let start, end;
  let mark: MarkType = undefined;
  const domChildren = elm.children;

  // this loop won't run if node.content is empty
  // html renders each item {InlineText, InlineAtom} wrapped in span tag
  for (let idx = 0; idx < content.length; idx++) {
    if (domChildren[idx].contains(startContainer)) {
      start = { inlineIdx: idx, offset: startOffset };
      from = prefixLen + startOffset;

    }
    if (domChildren[idx].contains(endContainer)) {
      end = { inlineIdx: idx, offset: endOffset };
      to = prefixLen + endOffset;
      break;
    }

    let item = content[idx]
    prefixLen += $BlockText.itemLength(item)

  }


  if (start && end && start.inlineIdx == end.inlineIdx) {
    const item = content[start.inlineIdx];
    if ($BlockText.isTextItem(item)) {
      mark = (item as InlineText).mark;
    }
  }
  return { from, to, mark, start, end, focusXY: calcFocusPos(sel) };

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

export function setDomSelection(elm: HTMLElement, start: InlineSelection, end: InlineSelection) {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();
  if (!start || !end) {
    range.setStart(elm, 0);
    range.setEnd(elm, 0);
  } else {

    const startChild = elm.children[start.inlineIdx];
    const endChild = elm.children[end.inlineIdx];

    if (start.isText) {
      range.setStart(startChild.firstChild, start.offset);
    } else {
      range.setStart(startChild, start.offset);
    }
    if (end.isText) {
      range.setEnd(endChild.firstChild, end.offset);
    } else {
      range.setEnd(endChild, end.offset);
    }
  }

  sel.removeAllRanges();
  sel.addRange(range);

}

export function adjustTextLocalSelection(elm: HTMLElement, content: InlineType[], from: number, to: number) {

  let start, end;
  let prefixLen = 0;
  for (let idx = 0; idx < content.length; idx++) {
    const { isText, itemLen } = $BlockText.itemInfo(content[idx]);
    if (from >= prefixLen && from <= prefixLen + itemLen) {
      start = { inlineIdx: idx, offset: from - prefixLen, isText };
    }
    if (to >= prefixLen && to <= prefixLen + itemLen) {
      end = { inlineIdx: idx, offset: to - prefixLen, isText };
    }
    prefixLen += itemLen;
  }

  setDomSelection(elm, start, end);

}


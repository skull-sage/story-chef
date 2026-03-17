
import { nextTick } from "process";
import { $BlockText, BlockText, InlineText, InlineType, MarkType } from "./text-types";
import { shallowRef, ShallowRef } from "vue";



export type BlockRangeSelection = {
  start: { blockId: number | string, from: number },
  end: { blockId: number | string, to: number },
  mark: MarkType,
}


export type TextSelection = {
  from: number;
  to: number;
  mark: MarkType;
  focusXY?: { x: number; y: number } | null;
  start?: { inlineIdx: number, offset: number };
  end?: { inlineIdx: number, offset: number };
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
    console.log("## tracking dom selection for content: ", content);
    this.selection.value = calcFromDomSelection(this.elm, content);

  }


  adjustDomSelection(content: InlineType[], from: number, to: number) {
    console.log("## adjusting dom selection: Remove Prev Ranges");
    this.domSelection.removeAllRanges();
    adjustTextLocalSelection(this.elm, content, from, to)
    //debugger;
    // nextTick(() => {

    //   console.log("## adjusting dom selection: Try setting new selection");
    //   adjustTextLocalSelection(this.elm, content, from, to)
    // });
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


export function adjustTextLocalSelection(elm: HTMLElement, content: InlineType[], from: number, to: number) {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();

  if (content.length == 0) {
    range.setStart(elm, 0);
    range.setEnd(elm, 0);
    sel.removeAllRanges();
    sel.addRange(range);
    return;
  }

  //range.setStart(elm, 0);
  //range.setEnd(elm, 0);
  let startIdx, startOffset, endIdx, endOffset;
  let prefixLen = 0;
  for (let idx = 0; idx < content.length; idx++) {
    const item = content[idx];
    const len = $BlockText.itemLength(item);
    if (from >= prefixLen && from <= prefixLen + len) {
      startIdx = idx;
      startOffset = from - prefixLen;
    }
    if (to >= prefixLen && to <= prefixLen + len) {
      endIdx = idx;
      endOffset = to - prefixLen;
    }
    prefixLen += len;
  }

  const children = elm.children;
  if ('text' in content[startIdx]) {
    range.setStart(children[startIdx].firstChild, startOffset);
  } else {
    range.setStart(children[startIdx], startOffset);
  }

  if ('text' in content[endIdx]) {
    range.setEnd(children[endIdx].firstChild, endOffset);

  } else {
    range.setEnd(children[endIdx], endOffset);
  }


  sel.addRange(range);

}


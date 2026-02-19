
import { text } from "animejs";
import { InlineText, InlineType, MarkType } from "./text-inline";




// Helper type for selection state
export interface TextSelection {
  start: { inlineIdx: number, offset: number };
  end: { inlineIdx: number, offset: number };
  focusXY?: { x: number; y: number } | null;
}


// calc text selection so that the selection is bounded by a single text block

export function calcTextLocalSelection(sel: Selection, childList: HTMLCollection, blockContent: InlineType[]) {

  if (sel.rangeCount === 0) {
    return null;
  }

  let { startContainer, startOffset, endContainer, endOffset } = sel.getRangeAt(0);

  let start //: HTMLElement = findContainerInline(startContainer);
  let end//: HTMLElement = findContainerInline(endContainer);
  let mark: MarkType;

  for (let idx = 0; idx < childList.length; idx++) {
    let child = childList[idx];

    if (child.contains(startContainer)) {
      start = { inlineIdx: idx, offset: startOffset };
    }
    if (start && child)
      if (child.contains(endContainer)) {
        end = { inlineIdx: idx, offset: endOffset };
      }
  }

  if (start.inlineIdx && start.inlineIdx == end.inlineIdx) {
    if (blockContent[start.inlineIdx].type == 'text')
      mark = (blockContent[start.inlineIdx] as InlineText).mark;
  }

  // if start and end inline-container are same and not atom, we know the mark
  // let inline: InlineType = blockContent[idx];
  // if (blockContent[idx].type == 'text') {
  //   mark = (blockContent[idx] as InlineText).mark
  // }

  // checking locality: both start and end of selection should be bounded by the text block
  if (start && end == false)
    return null;

  return { start, end, focus, mark };
}

const findContainerInline = (nodeElm: Node) => {
  let elm: HTMLElement;

  if (nodeElm instanceof Node == false)
    return undefined;

  if (nodeElm instanceof HTMLElement) {
    elm = nodeElm;
  }
  else {
    elm = nodeElm.parentElement;
  }

  while (!elm.dataset.offset) {
    elm = elm.parentElement;
  }

  return elm;

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


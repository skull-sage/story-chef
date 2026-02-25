
import { text } from "animejs";
import { InlineText, InlineType } from "./text-inline";
import { MarkType } from "./mark-inline";
import {expandSlice} from "./cmds-basic";




// Helper type for selection state
export interface TextSelection {
  start: { inlineIdx: number, offset: number };
  end: { inlineIdx: number, offset: number };
  focusXY?: { x: number; y: number } | null;
  mark?: MarkType;
}


// calc text selection so that the selection is bounded by a single text block

export function calcTextLocalSelection(sel: Selection, childList: HTMLCollection, blockContent: InlineType[]) :TextSelection {

  if (sel.rangeCount === 0) {
    return null;
  }


  //## NEED TO SIMPLIFY THIS LOGIC, MAYBE BY USING A FLAT STRUCTURE FOR THE TEXT BLOCK CONTENT

  let { startContainer, startOffset, endContainer, endOffset } = sel.getRangeAt(0);

  let start //: HTMLElement = findContainerInline(startContainer);
  let end//: HTMLElement = findContainerInline(endContainer);
  let mark: MarkType;

  for (let idx = 0; idx < childList.length; idx++) {
    if (childList[idx].contains(startContainer)) {
      if (blockContent[idx].length() == startOffset) {
        start = { inlineIdx: idx + 1, offset: 0 };
      } else {
        start = { inlineIdx: idx, offset: startOffset };
      }
      break;
    }
  }

  for (let idx = start.inlineIdx; idx < childList.length; idx++) {
    if (childList[idx].contains(endContainer)) {
      if (idx != start.inlineIdx && endOffset==0) {
        end = { inlineIdx: idx - 1, offset: blockContent[idx-1].length() };
      } else {
        end = { inlineIdx: idx, offset: endOffset };
      }
      break;
    }
  }


  // checking locality: both start and end of selection should be bounded by the text block
  if (start == undefined || end == undefined)
    return null;

  if (start && end && start.inlineIdx == end.inlineIdx) {
    if (blockContent[start.inlineIdx].isText())
      mark = (blockContent[start.inlineIdx] as InlineText).mark;
  }

  let selection: TextSelection = { start, end, focusXY: calcFocusPos(sel), mark };
   expandSlice(blockContent, selection);

  return selection;
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


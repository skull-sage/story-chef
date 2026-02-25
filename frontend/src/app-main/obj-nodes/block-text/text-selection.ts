
import { text } from "animejs";
import { InlineText, InlineType } from "./text-inline";
import { MarkType } from "./mark-inline";
import {expandSlice} from "./cmds-basic";

6710


// Helper type for selection state
export interface TextSelection {
  start: { inlineIdx: number, prefixLen:number, offset: number };
  end: { inlineIdx: number, prefixLen:number, offset: number };
  from: number;
  to: number;
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
  let from, prefixCount, to = 0;


  for (let idx = 0; idx < childList.length; idx++) {
    if (childList[idx].contains(startContainer)) {
        start = { inlineIdx: idx, prefixLen:prefixCount, offset: startOffset };
        from = prefixCount + startOffset;
        break
    }
    prefixCount += blockContent[idx].length();
  }

  for (let idx = start.inlineIdx; idx < childList.length; idx++) {
    if (childList[idx].contains(endContainer)) {
      end = { inlineIdx: idx, prefixLen: prefixCount, offset: endOffset };
      to = prefixCount + endOffset;
      break;
    }
    prefixCount += blockContent[idx].length();
  }


  // checking locality: both start and end of selection should be bounded by the text block
  if (start == undefined || end == undefined)
    return null;

  if (start && end && start.inlineIdx == end.inlineIdx) {
    if (blockContent[start.inlineIdx].isText())
      mark = (blockContent[start.inlineIdx] as InlineText).mark;
  }

  let selection: TextSelection = { start, end, from, to, focusXY: calcFocusPos(sel), mark };

  expandSlice(blockContent, selection);

  return selection;
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


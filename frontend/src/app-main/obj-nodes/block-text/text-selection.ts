
import { text } from "animejs";
import { InlineAtom, InlineText, InlineType } from "./text-inline";
import { MarkType } from "./mark-inline";
import { FlatContent } from "./cmds-basic";

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
  let from = 0, prefixLen = 0, to = 0;


  // block elm child list should be equal to blockContent except tail cursor elm
  for (let idx = 0; idx < blockContent.length; idx++) {
    if (childList[idx].contains(startContainer)) {
        start = { inlineIdx: idx, prefixLen:prefixLen, offset: startOffset };
        from = prefixLen + startOffset;

    }
    if (childList[idx].contains(endContainer)) {
      end = { inlineIdx: idx, prefixLen: prefixLen, offset: endOffset };
      to = prefixLen + endOffset;
      break;
    }
    if('text' in blockContent[idx]) {
      prefixLen += (blockContent[idx] as InlineText).text.length;
    } else {
      prefixLen += 1; // atom length is 1
    }
  }

  // checking locality: both start and end of selection should be bounded by the text block
  if (start == undefined || end == undefined)
    return null;

  if (start.inlineIdx == end.inlineIdx && 'text' in blockContent[start.inlineIdx]) {
      mark = (blockContent[start.inlineIdx] as InlineText).mark;
  }else mark = undefined;

  let selection: TextSelection = { start, end, from, to, focusXY: calcFocusPos(sel), mark };
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



import { $BlockText, BlockText, InlineText, InlineType, MarkType } from "./text-types";
import { FlatContent } from "./cmds-basic";


export type InlineSelection = {
  inlineIdx: number, prefixLen: number, offset: number
}

export type FlatSelection = {
  from: number,
  to: number,
  mark: MarkType,
}

// Helper type for selection state
export interface TextSelection {
  start: InlineSelection;
  end: InlineSelection;
  flat: FlatSelection;
  focusXY?: { x: number; y: number } | null;
}


// calc text selection so that the selection is bounded by a single text block

export function calcTextLocalSelection(sel: Selection, elm: HTMLElement, node: BlockText): TextSelection {

  if (!sel || sel.rangeCount === 0) {
    return null;
  }

  let { startContainer, startOffset, endContainer, endOffset } = sel.getRangeAt(0);

  let start:InlineSelection = undefined;
  let end:InlineSelection = undefined
  let mark: MarkType;
  let from = 0, prefixLen = 0, to = 0;

  const domChildren = elm.children;


  // block elm child list should be equal to blockContent except tail cursor elm
  for (let idx = 0; idx < node.content.length; idx++) {
    if (domChildren[idx].contains(startContainer)) {
      start = { inlineIdx: idx, prefixLen: prefixLen, offset: startOffset };
      from = prefixLen + startOffset;

    }
    if (domChildren[idx].contains(endContainer)) {
      end = { inlineIdx: idx, prefixLen: prefixLen, offset: endOffset };
      to = prefixLen + endOffset;
      break;
    }

    let item = node.content[idx]
    prefixLen += $BlockText.itemLength(item)

  }

  // checking locality: both start and end of selection should be bounded by the text block
  if (start == undefined || end == undefined)
    return null;

  if(start.inlineIdx == end.inlineIdx){
    const item = node.content[start.inlineIdx];
    if($BlockText.isTextItem(item)){
      mark = (item as InlineText).mark;
    }
  }

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


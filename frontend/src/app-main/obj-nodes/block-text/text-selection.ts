
import { $BlockText, BlockText, InlineText, InlineType, MarkType } from "./text-types";



export type BlockRangeSelection = {
  start: {blockId: number|string, from:number},
  end: {blockId: number|string, to:number},
  mark: MarkType,
}
 

// Helper type for selection state
export interface BlockTextSelection {
  //start: InlineSelection; // kept for future reference
  //end: InlineSelection;
  from: number;
  to: number;
  start: {inlineIdx:number, offset:number}
  end: {inlineIdx:number, offset:number}
  mark: MarkType;
  focusXY?: { x: number; y: number } | null;
}


//calculate block text local selection
// NOTE: Content is (InlineText | Atom) [],
// Runtime expanded Content is ({char, mark} | atom)[],
// Char Len = 1, atom = 1, char are collapsed into InlineText by mark-equality

export function calcTextLocalSelection(sel: Selection, elm: HTMLElement, node: BlockText): BlockTextSelection {

  if (!sel || sel.rangeCount === 0) {
    return null;
  }

  let { startContainer, startOffset, endContainer, endOffset } = sel.getRangeAt(0);

  let mark: MarkType;
  let from = 0, prefixLen = 0, to = 0;
  const domChildren = elm.children;
  let start, end = undefined

  // block elm child list should be equal to blockContent except tail cursor elm
  for (let idx = 0; idx < node.content.length; idx++) {
    if (domChildren[idx].contains(startContainer)) {
      start = {inlineIdx:idx, offset:startOffset};
      from = prefixLen + startOffset;

    }
    if (domChildren[idx].contains(endContainer)) {
      end = {inlineIdx:idx, offset:endOffset};
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

  let selection: BlockTextSelection = { start, end, from, to, focusXY: calcFocusPos(sel), mark };
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


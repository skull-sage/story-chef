import { InlineType } from "./text-inline";




// Helper type for selection state
export interface TextSelection {
  start: number | null;
  end: number | null;
  focusXY?: { x: number; y: number } | null;
}


// calc text selection so that the selection is bounded by a single text block

export function calcTextLocalSelection(sel: Selection, childList: HTMLCollection, blockContent: InlineType[]) {

  if (sel.rangeCount === 0) {
    return null;
  }

  let { startContainer, startOffset, endContainer, endOffset } = sel.getRangeAt(0);

  let start:HTMLElement  = findContainerInline(startContainer);
  let end:HTMLElement    = findContainerInline(endContainer);

  if ( start == undefined ||  end == undefined) {
    return undefined;
  }

  // for (let idx = 0; idx < childList.length; idx++) {
  //   let child = childList[idx];
  //   if (child.contains(startContainer)) {
  //     start = { inlineIdx: idx, offset: startOffset };
  //   }
  //   if (child.contains(endContainer)) {
  //     end = { inlineIdx: idx, offset: endOffset };
  //   }
  // }

  // // checking locality: both start and end of selection should be bounded by the text block
  // if (start && end == false)
  //   return null;

  return {
    start: parseInt(start.dataset.offset),
    end: parseInt(end.dataset.offset),
    focusXY: calcFocusPos(sel)
  };
}

const findContainerInline = (nodeElm : Node) => {
  let elm:HTMLElement;

  if (nodeElm instanceof Node == false)
    return undefined;

  if (nodeElm instanceof HTMLElement){
    elm = nodeElm;
  }
  else {
    elm = nodeElm.parentElement;
  }

  while( !elm.dataset.offset){
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


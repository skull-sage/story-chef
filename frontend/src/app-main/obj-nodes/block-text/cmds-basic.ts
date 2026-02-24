import type { InlineText, InlineAtom, InlineType } from "./text-inline"
import type { BlockText } from "./block-type"
import { TextSelection } from "./text-selection"
import { isMarkEqual, MarkType } from "./mark-inline";
import { debug } from "console";

type Expanded = {
  valArr: (number|InlineAtom)[], // utf16-CharCode or Atom
  markArr: (MarkType|undefined)[],
  from: number,
  to: number,
}

function expandText(valArr: (number|InlineAtom)[], markArr: (MarkType|undefined)[], item: InlineText){
  for (let i = 0; i < item.text.length; i++) {
    valArr.push(item.text.charCodeAt(i));
    markArr.push(item.mark);
  }
}


function expandSlice(content:InlineType[], sel:TextSelection){
  let {start, end} = sel
  let valArr: (number|InlineAtom)[] = [];
  let markArr: (MarkType|undefined)[] = [];
  let from = start.offset;
  let prefixCount = from;

  if(start.inlineIdx == end.inlineIdx){
    
    let item = content[start.inlineIdx] ;
    if(item.type == 'atom'){
      valArr.push(item);
      markArr.push(undefined)
      prefixCount++;
    } else {
      expandText(valArr, markArr, item as InlineText);
      prefixCount += end.offset;
    } 
  }

  for (let i = start.inlineIdx; i <= end.inlineIdx && end.offset > 0; i++) {
    let item:InlineType = content[i];
    
    if (item.type == 'atom') {
      valArr.push(item);
      markArr.push(undefined);
      prefixCount++;
    } else {
      expandText(valArr, markArr, item as InlineText);
      prefixCount += item.text.length; 
    } 
  } 
  
}

export default {
  replaceText(node: BlockText, text: string, selection: TextSelection) {

  },

  insertAtom(node: BlockText, atom: InlineAtom, selection: TextSelection) {

  },

  toggleMark(node: BlockText, mark: MarkType, selection: TextSelection): boolean {
    const { start, end } = selection;
    const content = node.content;

    // if selection contains an atom, we don't apply mark and return false
    // if selection contains a text with same mark,
    //we clear existing mark with undefined
    for (let i = start.inlineIdx; i <= end.inlineIdx; i++) {
      if (content[i].type === "atom") return false;
      else if (content[i].type === "text") {
        let item = content[i] as InlineText;
        // if (isMarkEqual(item.mark, mark)) {
        //   mark = undefined;
        // }
      }
    }


    const newSegments: InlineType[] = [];
    let startItem = content[start.inlineIdx] as InlineText;
    let endItem = content[end.inlineIdx] as InlineText;


    let prefixSlice = startItem.text.slice(0, start.offset);
    newSegments.push({ type: "text", text: prefixSlice, mark: startItem.mark });

    let selectedSlice: string;
    if (start.inlineIdx == end.inlineIdx) {
      if (isMarkEqual(startItem.mark, mark)) {
        mark = undefined;
      }
      selectedSlice = startItem.text.slice(start.offset, end.offset);

    } else {

      selectedSlice = startItem.text.slice(start.offset, startItem.text.length);
      for (let i = start.inlineIdx + 1; i < end.inlineIdx; i++) {
        let item = content[i] as InlineText
        selectedSlice += item.text;
      }
      selectedSlice += endItem.text.slice(0, end.offset);
    }

    newSegments.push({ type: "text", text: selectedSlice, mark: mark });


    let suffixSlice = endItem.text.slice(end.offset);
    newSegments.push({ type: "text", text: suffixSlice, mark: endItem.mark });

    // splice new segments in place of the old range

    content.splice(start.inlineIdx, end.inlineIdx - start.inlineIdx + 1, ...newSegments);

    if (!node.renderKey) node.renderKey = 0
    node.renderKey++;

    return true;
  }

}



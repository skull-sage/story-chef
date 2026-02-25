import { InlineText, InlineAtom, InlineType } from "./text-inline"
import type { BlockText } from "./block-type"
import { TextSelection } from "./text-selection"
import { isMarkEqual, MarkType } from "./mark-inline";
import { debug } from "console";


class BlockFlat {
  valArr: (number | InlineAtom)[] = [];
  markArr: (MarkType | undefined)[] = [];

  constructor(content: InlineType[]) {
    for (let idx = 0; idx < content.length; idx++) {
      let item = content[idx];
      if (item.isText()) {
        for (let i = 0; i < item.text.length; i++) {
          this.valArr.push(item.text.charCodeAt(i));
          this.markArr.push(item.mark);
        }
      } else {
        this.valArr.push(item as InlineAtom);
        this.markArr.push(undefined);
      }
    }
  }

  applyMark(from: number, to: number, mark: MarkType): InlineType[] {
    for (let idx = from; idx < to; idx++) {
         this.markArr[idx] = mark;
    }

    const newContent: InlineType[] = [];
    let currentMark: MarkType | undefined = this.markArr[0];
    let currentText = "";

    for (let idx = 0; idx < this.valArr.length; idx++) {
      if (typeof this.valArr[idx] === "number") {
        if (this.markArr[idx] !== currentMark) {
          if (currentText) {
            newContent.push(new InlineText(currentText, currentMark));
          }
          currentMark = this.markArr[idx];
          currentText = "";
        }
        currentText += String.fromCharCode(this.valArr[idx] as number);
      } else {
        if (currentText) {
          newContent.push(new InlineText(currentText, currentMark));
          currentText = "";
        }
        newContent.push(new InlineAtom(this.valArr[idx] as InlineAtom, undefined));
      }
    }

    if (currentText) {
      newContent.push(new InlineText(currentText, currentMark));
    }

    return newContent;

  }
}


export function expandSlice(content:InlineType[], sel:TextSelection){
  let {from, to} = sel
  const valArr: ValType[] = [];

  for (let idx=0; idx<content.length; idx++){
    let item = content[idx];
    if(item.isText()){
      for (let i = 0; i < item.text.length; i++) {
        valArr.push({val: item.text.charCodeAt(i), mark: item.mark});
      }
    } else {
        valArr.push({val: item as InlineAtom, mark: undefined});

    }
  }



  console.log("from", from, "to", to);
  let result = ""
  for(let idx=from; idx<to; idx++){
     let item = valArr[idx];
     if (typeof item.val === "number")
      result += String.fromCharCode(item.val as number);
    else result += "(atom)";
  }
  console.log("#:", result);

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

    expandSlice(content, selection);


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

    console.log(content);
    if (!node.renderKey) node.renderKey = 0
    node.renderKey++;

    return true;
  }

}



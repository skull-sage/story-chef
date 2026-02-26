import { InlineText, InlineAtom, InlineType } from "./text-inline"
import type { BlockText } from "./block-type"
import { TextSelection } from "./text-selection"
import { isMarkEqual, MarkType } from "./mark-inline";
import { debug } from "console";


export class FlatContent  {
  valArr: (number | InlineAtom)[] = [];
  markArr: (MarkType | undefined)[] = [];

  constructor(valArr: (number | InlineAtom)[], markArr: (MarkType | undefined)[]) {
    this.valArr = valArr;
    this.markArr = markArr;
  }

  static expand(content: InlineType[]): FlatContent {
    const flat = new FlatContent([], []);
    for (let idx = 0; idx < content.length; idx++) {
      let item = content[idx];
      if ('text' in item) {
        for (let i = 0; i < item.text.length; i++) {
          flat.valArr.push(item.text.charCodeAt(i));
          flat.markArr.push(item.mark);
        }
      } else {
        flat.valArr.push(item as InlineAtom);
        flat.markArr.push(undefined);
      }
    }
    return flat;
  }

  log(from: number, to: number) {
    console.log("Flat Raneg:", from, "to:", to);
    let currText = "", result ="";
    let currMark:MarkType = this.markArr[from];

    for (let i = from; i < to && i < this.valArr.length; i++) {
       if(typeof this.valArr[i] === 'number') {
        if(this.markArr[i] !== currMark) {
          if(currText){
              result += `{${currText},${currMark?.type}}`;
          }
          currText = String.fromCharCode(this.valArr[i] as number);
          currMark = this.markArr[i];
        } else {
          currText += String.fromCharCode(this.valArr[i] as number);
        }
      } else {
        if(currText) {
          result += `{${currText},${currMark?.type}}`;
          currText = "";
        }
        result += "(atom)";
        currText = "";
        currMark = undefined;
      }

    }

    if(currText) {
      result += `{${currText},${currMark?.type}}`;
    }

    console.log("#sel", result);
  }

  collapse(): InlineType[] {
    const newContent: InlineType[] = [];
    let currentMark: MarkType | undefined = this.markArr[0];
    let sliceStart, sliceEnd: number;
    let currentText = "";

    for (let idx = 0; idx < this.valArr.length; idx++) {

      if(typeof this.valArr[idx] === 'number') {
          if (!isMarkEqual(this.markArr[idx], currentMark)) {
            if (currentText) {
              newContent.push({ text: currentText, mark: currentMark } as InlineText);
            }
            currentMark = this.markArr[idx];
            currentText = String.fromCharCode(this.valArr[idx] as number);
          } else {
            currentText += String.fromCharCode(this.valArr[idx] as number);
          }
      } else { // atom
        if (currentText) {
          newContent.push({ text: currentText, mark: currentMark } as InlineText);
          currentText = "";
          currentMark = undefined;
        }
        newContent.push(this.valArr[idx] as InlineAtom);

      }

    }

    if (currentText) {
      newContent.push({ text: currentText, mark: currentMark } as InlineText);
    }

    return newContent;
  }

  applyMark(from: number, to: number, mark: MarkType): InlineType[] {
    for (let idx = from; idx < to; idx++) {
         this.markArr[idx] = mark;
    }
    return this.collapse();

  }

  replaceText(from: number, to: number, newText: string): InlineType[] {

    this.valArr.splice(from, to - from, ...[...newText].map(ch => ch.charCodeAt(0)));
    this.markArr.splice(from, to - from, ...new Array(newText.length).fill(undefined));
    return this.collapse();

  }
}



export default {
  replaceText(node: BlockText, text: string, selection: TextSelection) {
    const { from, to } = selection;
    const flatContent = FlatContent.expand(node.content);
    const newContent = flatContent.replaceText(from, to, text);
    node.content = newContent;
    console.log("New Content:", node.content);
    //if (!node.renderKey) node.renderKey = 0;
    //node.renderKey++;
  },

  insertAtom(node: BlockText, atom: InlineAtom, selection: TextSelection) {

  },

  applyMark(node: BlockText, mark: MarkType, selection: TextSelection) {
    const { from, to } = selection;
    const flatContent = FlatContent.expand(node.content);
    flatContent.log(from, to);
    if(selection.mark && isMarkEqual(selection.mark, mark)) {
      mark = undefined;
    }
    const newContent = flatContent.applyMark(from, to, mark);
    node.content = newContent;
    console.log("New Content:", node.content);
    //if (!node.renderKey) node.renderKey = 0;
    //node.renderKey++;
  }

  // toggleMark(node: BlockText, mark: MarkType, selection: TextSelection): boolean {
  //   const { start, end } = selection;
  //   const content = node.content;

  //   // if selection contains an atom, we don't apply mark and return false
  //   // if selection contains a text with same mark,
  //   //we clear existing mark with undefined
  //   for (let i = start.inlineIdx; i <= end.inlineIdx; i++) {
  //     if (content[i].type === "atom") return false;
  //     else if (content[i].type === "text") {
  //       let item = content[i] as InlineText;
  //       // if (isMarkEqual(item.mark, mark)) {
  //       //   mark = undefined;
  //       // }
  //     }
  //   }

  //   expandSlice(content, selection);


  //   const newSegments: InlineType[] = [];
  //   let startItem = content[start.inlineIdx] as InlineText;
  //   let endItem = content[end.inlineIdx] as InlineText;


  //   let prefixSlice = startItem.text.slice(0, start.offset);
  //   newSegments.push({ type: "text", text: prefixSlice, mark: startItem.mark });

  //   let selectedSlice: string;
  //   if (start.inlineIdx == end.inlineIdx) {
  //     if (isMarkEqual(startItem.mark, mark)) {
  //       mark = undefined;
  //     }
  //     selectedSlice = startItem.text.slice(start.offset, end.offset);

  //   } else {

  //     selectedSlice = startItem.text.slice(start.offset, startItem.text.length);
  //     for (let i = start.inlineIdx + 1; i < end.inlineIdx; i++) {
  //       let item = content[i] as InlineText
  //       selectedSlice += item.text;
  //     }
  //     selectedSlice += endItem.text.slice(0, end.offset);
  //   }

  //   newSegments.push({ type: "text", text: selectedSlice, mark: mark });


  //   let suffixSlice = endItem.text.slice(end.offset);
  //   newSegments.push({ type: "text", text: suffixSlice, mark: endItem.mark });

  //   // splice new segments in place of the old range

  //   content.splice(start.inlineIdx, end.inlineIdx - start.inlineIdx + 1, ...newSegments);

  //   console.log(content);
  //   if (!node.renderKey) node.renderKey = 0
  //   node.renderKey++;

  //   return true;
  // }

}



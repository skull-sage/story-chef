import { InlineText, InlineAtom, InlineType, isMarkEqual, MarkType } from "./text-types"
import { BlockText } from "./text-types"
import { TextSelection } from "./text-selection"
import { DocText } from "./doc-text";




export class FlatContent {
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
    let currText = "", result = "";
    let currMark: MarkType = this.markArr[from];

    for (let i = from; i < to && i < this.valArr.length; i++) {
      if (typeof this.valArr[i] === 'number') {
        if (this.markArr[i] !== currMark) {
          if (currText) {
            result += `{${currText},${currMark?.type}}`;
          }
          currText = String.fromCharCode(this.valArr[i] as number);
          currMark = this.markArr[i];
        } else {
          currText += String.fromCharCode(this.valArr[i] as number);
        }
      } else {
        if (currText) {
          result += `{${currText},${currMark?.type}}`;
          currText = "";
        }
        result += "(atom)";
        currText = "";
        currMark = undefined;
      }

    }

    if (currText) {
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

      if (typeof this.valArr[idx] === 'number') {
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

  replaceText(from: number, to: number, newText: string, mark: MarkType | undefined): InlineType[] {

    this.valArr.splice(from, to - from, ...[...newText].map(ch => ch.charCodeAt(0)));
    this.markArr.splice(from, to - from, ...new Array(newText.length).fill(mark));
    return this.collapse();

  }
}

// as this function is common to many commands we intend to make
// updating selction should change the domSelection utilizing Vue Watch Effect
function replaceText(node:BlockText, selection: TextSelection, text: string){
    const { from, to, mark } = selection;
    const flatContent = FlatContent.expand(node.content);
    const newContent = flatContent.replaceText(from, to, text, mark);
    node.content = newContent;
    selection.from = from + text.length; // abc|abcd|
    selection.to = selection.from;
    console.log("New Content:", node.content);
}

export default {
  // make prefix means we are creating functions that return
  // command (node, selection) => {mutation logic here}
  makeReplaceText: (text: string) =>  ({dataNode, selection} : DocText) => {
    replaceText(dataNode, selection, text);
  },

  makeClipboardPaste: () => (node: BlockText, selection: TextSelection) => {
      navigator.clipboard.readText().then((raw) => {
            if (!raw) return;
            replaceText(node, selection, raw);
        });
  },

  makeInsertAtom: (atom: InlineAtom) => (node: BlockText, selection: TextSelection) => {
     console.warn("makeInsertAtom is not implemented yet");
  },

  makeDeleteLeft: () => (node: BlockText, selection: TextSelection) => {
    const { from, to, mark } = selection;
    if(from !== to || from === 0) return; // if there is a selection or cursor is at the start, do nothing

    const flatContent = FlatContent.expand(node.content);
    node.content = flatContent.replaceText(from-1, to, '', mark);
    selection.from = selection.to = from -1; // abc|abcd|
  },

  makeApplyMark: (mark: MarkType) => (node: BlockText, selection: TextSelection) => {
    const { from, to } = selection;
    const flatContent = FlatContent.expand(node.content);
    flatContent.log(from, to);
    if (selection.mark && isMarkEqual(selection.mark, mark)) {
      mark = undefined;
    }
    const newContent = flatContent.applyMark(from, to, mark);
    node.content = newContent;
    console.log("New Content:", node.content);
  },

  makeApplyAttr: (attr: Object) => (node: BlockText, selection: TextSelection) => {
    for (const key in attr) {
      node.attrs[key] = attr[key];
    }

  }

}



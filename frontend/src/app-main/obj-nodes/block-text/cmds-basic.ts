import { InlineText, InlineAtom, InlineType, isMarkEqual, MarkType } from "./text-types"
import { BlockText } from "./text-types"
import { SelectionState, TextSelection } from "./text-selection"




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
function replaceText(node: BlockText, selState: SelectionState, text: string) {
  const { from, to, mark } = selState.selection.value;
  const flatContent = FlatContent.expand(node.content);
  const newContent = flatContent.replaceText(from, to, text, mark);
  node.content = newContent;
  const result = from + text.length;
  selState.adjustDomSelection(node.content, result, result); // abc|abcd|
}


export default {
  // make prefix means we are creating functions that return
  // command (node, selection) => {mutation logic here}

  makeReplaceText: (text: string) => (node: BlockText, selState: SelectionState) => {
    replaceText(node, selState, text);
  },

  makeClipboardPaste: () => (node: BlockText, selState: SelectionState) => {
    navigator.clipboard.readText().then((raw) => {
      if (!raw) return;
      replaceText(node, selState, raw);
    });
  },

  makeInsertAtom: (atom: InlineAtom) => (node: BlockText, selState: SelectionState) => {
    console.warn("makeInsertAtom is not implemented yet");
  },

  makeDeleteLeft: () => (node: BlockText, selState: SelectionState) => {
    const { from, to, mark } = selState.selection.value;
    if (from === 0 && to === 0) return; // if there is a selection or cursor is at the start, do nothing

    const flatContent = FlatContent.expand(node.content);
    if (to - from > 0) {
      node.content = flatContent.replaceText(from, to, '', mark);
      selState.adjustDomSelection(node.content, from, from); // abc|abcd|
    } else {
      node.content = flatContent.replaceText(from - 1, to, '', mark);
      selState.adjustDomSelection(node.content, from - 1, from - 1); // abc|abcd|
    }

  },

  makeApplyMark: (mark: MarkType) => (node: BlockText, selState: SelectionState) => {
    const { from, to } = selState.selection.value;
    const flatContent = FlatContent.expand(node.content);
    flatContent.log(from, to);
    if (selState.selection.value.mark && isMarkEqual(selState.selection.value.mark, mark)) {
      mark = undefined;
    }
    const newContent = flatContent.applyMark(from, to, mark);
    node.content = newContent;
    selState.adjustDomSelection(node.content, from, to);
  },

  makeApplyAttr: (attr: Object) => (node: BlockText, selState: SelectionState) => {
    for (const key in attr) {
      node.attrs[key] = attr[key];
    }

  }

}



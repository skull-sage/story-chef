import { InlineText, InlineAtom, InlineItem, isMarkEqual, MarkType, TextNodeAttr } from "./text-types"
import { BlockText } from "./text-types"
import { TextSelection } from "./text-selection"
import { nextTick } from "process";
import NinState from "./nin-store";
import NinStore from "./nin-store";




export class FlatContent {
  valArr: (number | InlineAtom)[] = [];
  markArr: (MarkType | undefined)[] = [];

  constructor(valArr: (number | InlineAtom)[], markArr: (MarkType | undefined)[]) {
    this.valArr = valArr;
    this.markArr = markArr;
  }

  static expand(content: InlineItem[]): FlatContent {
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

  collapse(): InlineItem[] {
    const newContent: InlineItem[] = [];
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

  applyMark(from: number, to: number, mark: MarkType): InlineItem[] {
    for (let idx = from; idx < to; idx++) {
      this.markArr[idx] = mark;
    }
    return this.collapse();

  }

  replaceText(from: number, to: number, newText: string, mark: MarkType | undefined): InlineItem[] {

    this.valArr.splice(from, to - from, ...[...newText].map(ch => ch.charCodeAt(0)));
    this.markArr.splice(from, to - from, ...new Array(newText.length).fill(mark));
    return this.collapse();

  }
}

// as this function is common to many commands we intend to make
// updating selction should change the domSelection utilizing Vue Watch Effect
function replaceText(ninState: NinState, text: string) {
  const { from, to, mark } = ninState.selection;
  const flatContent = FlatContent.expand(ninState.dataNode.content);
  const newContent = flatContent.replaceText(from, to, text, mark);
  const result = from + text.length;
  ninState.$patchContent(newContent, result, result);

  // abc|abcd|
}


export default {
  // make prefix means we are creating functions that return
  // command (node, selection) => {mutation logic here}

  makeReplaceText: (text: string) => (ninState: NinState) => {
    replaceText(ninState, text);
  },

  makeClipboardPaste: () => (ninState: NinState) => {
    navigator.clipboard.readText().then((raw) => {
      if (!raw) return;
      replaceText(ninState, raw);
    });
  },

  makeInsertAtom: (atom: InlineAtom) => (ninState: NinState) => {
    console.warn("makeInsertAtom is not implemented yet");
  },

  makeDeleteLeft: () => (ninState: NinStore) => {
    const { from, to, mark } = ninState.selection;
    if (to - from == 0) return; // if there is a selection or cursor is at the start, do nothing

    const flatContent = FlatContent.expand(ninState.dataNode.content);
    const newContent = flatContent.replaceText(from, to, '', mark);
    ninState.$patchContent(newContent, from, from);

    /*
    delete with Caret selection  are left for handling mutation observer:
       ninState.dataNode.content = flatContent.replaceText(from - 1, to, '', mark);
      ninState.adjustDomSelection(ninState.dataNode.content, from - 1, from - 1);
    */

  },

  makeApplyMark: (mark: MarkType) => (ninState: NinState) => {
    const { from, to, mark: selMark } = ninState.selection;
    const flatContent = FlatContent.expand(ninState.dataNode.content);
    let toApply = selMark && isMarkEqual(selMark, mark) ? undefined : mark;
    const newContent = flatContent.applyMark(from, to, toApply);
    ninState.$patchContent(newContent, from, to);
  },

  makeApplyAttr: (attr: TextNodeAttr) => (ninState: NinState) => {
    ninState.$patchAttr(attr);
  }

}




import { InlineAtom, InlineItem, InlineText, isMarkEqual, MarkType } from "./text-types";


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

import { BlockNode } from "./block-type";



export interface MarkType {
  type: string
  [key: string]: any
}



export type MarkFormat = MarkType & {
  type: "format",
  format: "bold" | "italic" | "code",
}

export type MarkLink = MarkType & {
  type: "link"
  href: string,
  title: string,
  target: string,
  rel: string,
}

export function isMarkEqual(markA: MarkType, markB: MarkType): boolean {

  if (markA === markB)
    return true

  if (!markA || !markB) return false;

  for (const key in markA) {
    if (markA[key] !== markB[key])
      return false
  }
  return true
}

export type MarkHighlight = MarkType & {
  type: "highlight"
  styleClz: string // uline | h-uline | bg-line | h-bg-line | h-circle
  color: string
}



export interface InlineType {
  [key: string]: any,
}

export type InlineText = InlineType & {
  text: string;
  mark: MarkType;
}

export type InlineAtom = InlineType & {
  name: string;
  attrs: Record<string, any>;
}


export class BlockText implements BlockNode {
  id: number | string;
  renderKey: number = 0;
  type: string = "block-text";
  prev?: number;
  next?: number;
  parent?: number;
  content: InlineType[]


  static simple(content: InlineType[]): BlockText {
    const block = new BlockText();

    let itemList: InlineType[] = [];
    for (let idx = 0; idx < content.length; idx++) {
      if (content[idx].text) {
        itemList.push(content[idx]);
      } else if (content[idx].name && content[idx].attrs) {
        itemList.push(content[idx]);
      } else {
        console.warn(`item ${idx} of Block Text is not an InlineText or InlineAtom.`);
      }
    }
    block.content = itemList;
    return block;
  }

  isText(inlineIdx: number): boolean {
    return "text" in this.content[inlineIdx];
  }

  itemLen(inlineIdx: number): number {
    if (!this.isText(inlineIdx)) return 0;
    return this.content[inlineIdx].text.length;
  }


}

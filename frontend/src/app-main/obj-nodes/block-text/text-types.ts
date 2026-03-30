
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



export type InlineItem = InlineText | InlineAtom;

export type InlineText = {
  text: string;
  mark: MarkType;
}

export type InlineAtom = {
  name: string;
  attrs: Record<string, any>;
}

export type TextNodeAttr = {
  level?: 'h1' | 'h2' | 'h3' | 'paragraph' | string;
  align?: 'left' | 'center' | 'right' | string;
  txtColor?: string; // text color in hex
  bgColor?: string; // background color in hex
}

export interface BlockText {
  // id: string|number;
  content: InlineItem[];
  attrs: TextNodeAttr;
}


export const $BlockText = {
  sanitize(node: BlockText): BlockText {

    if (node == undefined) {
      let attrs = { level: 'paragraph', align: 'left', color: '#000000' };
      let content = [{ text: '', mark: undefined }];
      return { attrs, content }
    }

    const clone: BlockText = { ...node, attrs: { ...node.attrs } };
    const newContent: InlineItem[] = [];

    if (node.content.length === 0) {
      newContent.push({ text: '', mark: undefined });
    } else {
      for (let idx = 0; idx < node.content.length; idx++) {
        let item: InlineItem = node.content[idx];
        if ('text' in item || 'name' in item) {
          newContent.push(item);
        } else {
          console.warn(`item ${idx} of Block Text is not an InlineText or InlineAtom.`);
        }
      }
    }


    clone.content = newContent;
    return clone;
  },

  isTextItem(item: InlineItem) {
    return 'text' in item
  },

  itemLength(item: InlineItem) {
    if ('text' in item) {
      return item.text?.length || 0;
    }
    return 1; // atom length is 1
  },

  itemInfo(item: InlineItem) {
    if ('text' in item) {
      return { isText: true, itemLen: item.text.length };
    } else {
      return { isText: false, itemLen: 1 };
    }
  }


}


export const COMMON_MARK = {
  bold: { type: 'format', format: 'bold' },
  italic: { type: 'format', format: 'italic' },
  code: { type: 'format', format: 'code' },
  hl_bgline: { type: 'highlight', styleClz: 'bg-line', color: '#ffe066' },
  hl_uline: { type: 'highlight', styleClz: 'uline', color: '#ffe066' },
}



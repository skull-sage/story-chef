
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



export type InlineType = InlineText | InlineAtom;

export type InlineText = {
  text: string;
  mark: MarkType;
}

export type InlineAtom =  {
  name: string;
  attrs: Record<string, any>;
}

export type BlockText = {
  id: string|number;
  content: InlineType[]
}


export const $BlockText = {
  sanitize(node : BlockText) : BlockText{

    if(node== undefined)
      return {id:undefined, content:[]}

    const newContent = [];
    for (let idx = 0; idx < node.content.length; idx++) {
      let item:InlineType = node.content[idx];
      if ($BlockText.isTextItem(item)) {
          newContent.push(item);
        } else if ('name' in item) {
          newContent.push(item);
        } else {
          console.warn(`item ${idx} of Block Text is not an InlineText or InlineAtom.`);
        }
    }
    node.content = newContent;
    return node;
  },

  isTextItem(item:InlineType){
    return 'text' in item
  },

  itemLength(item:InlineType){
    if ($BlockText.isTextItem(item)) {
      return item.text?.length || 0;
    }
    return 1; // atom length is 1
  }

}


export const COMMON_MARK = {
  bold: { type: 'format', format: 'bold' },
  italic: { type: 'format', format: 'italic' },
  code: { type: 'format', format: 'code' },
  highlight: { type: 'highlight', styleClz: 'bg-line', color: '#ffe066' },
  underline: { type: 'highlight', styleClz: 'uline', color: '#ffe066' },
}



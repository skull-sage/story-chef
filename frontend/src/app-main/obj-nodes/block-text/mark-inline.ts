

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

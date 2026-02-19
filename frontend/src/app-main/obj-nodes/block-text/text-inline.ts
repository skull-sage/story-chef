
export type InlineType = InlineText | InlineAtom



export type InlineText = {
  type: "text"
  text: string
  mark?: MarkType
}

export type InlineAtom = {
  type: "atom"
  name: string // vue component name to render
  attrs: Record<string, any>
}

export type MarkFormat = {
  type: "format"
  format: "bold" | "italic" | "strike"
}

export type MarkLink = {
  type: "link"
  href: string
}

export type MarkHighlight = {
  type: "highlight"
  styleClz: string // uline | h-uline | bg-line | h-bg-line | h-circle
  color: string
}


export type MarkCode = {
  type: "code"
}

export type MarkType = MarkFormat | MarkLink | MarkHighlight | MarkCode



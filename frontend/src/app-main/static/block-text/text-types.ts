
export type InlineType = "text" | "atom"


export type BlockText = {
  type: "block-text"
  content: (TextNode | AtomNode)[]
}

export type TextNode = {
  type: "text"
  text: string
  mark: MarkType
}

export type AtomNode = {
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
  style: string // h-underline | underline | h-circle | bg-line | h-bg-line
  color: string
}


export type MarkCode = {
  type: "code"
}

export type MarkType = MarkFormat | MarkLink | MarkHighlight | MarkCode



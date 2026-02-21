import { MarkType } from "./mark-inline"

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



import { InlineAtom, InlineText, InlineType } from "./text-inline"

export type BlockAtom = BlockNode & {
  type: "block-atom"
  // atoms are rendered as vue component
  // <component :is="component" v-bind="attrs" />
  vname: string
  attrs: object
}

export type BlockTextList = BlockNode & {
  type: "block-list"
  style: string
  content: BlockText[]
}

// export type BlockTable = BlockNode & {
//   type: "block-table"
//   header: BlockText[]
//   rows: BlockText[]
// }


export type BlockText = BlockNode & {
  type: "block-text"
  content: InlineType[]
}

export type BlockNode = {
  renderKey: number
  type: string
  prev: number
  next: number
  parent: number
  id: number
}

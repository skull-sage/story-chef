import { AtomNode, TextNode } from "./text-inline"

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
  content: (TextNode | AtomNode)[]
}

export type BlockNode = {
  type: string
  prev: string
  next: string
  parent: string
  id: string | number
}

export type NinSelection = {
  startBlockId: string | number // upper block of the selection as doc is top-down rendered
  endBlockId: string | number // below block of the selection as doc is top-down rendered
  startOffset: number // offset of the selection in the upper block
  endOffset: number // offset of the selection in the below block
  head: "start" | "end" // head of the selection
}

export type NinDoc = {
  nodeMap: Record<string | number, BlockNode>
  selection: NinSelection
}

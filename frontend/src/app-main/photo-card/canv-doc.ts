import { BlockNode } from "../obj-nodes/block-text/block-type"


export type RangeSelection = {
  startBlockId: string | number // upper block of the selection as doc is top-down rendered
  endBlockId: string | number // below block of the selection as doc is top-down rendered
  startOffset: number // offset of the selection in the upper block
  endOffset: number // offset of the selection in the below block
  head: "start" | "end" // head of the selection
}

export type Selection = {
  type: "range" | "node" | "block_text"
  range?: RangeSelection
  node?: string | number
  block_text?: string | number
}




export type CanvDoc = {
  userClockMap: Record<string | number, number>
  nodeMap: Record<string | number, BlockNode>
  selection: Selection
  selectionMap: Record<string | number, Selection>
}



export type BlockAtom = BlockNode & {
  type: "block-atom"
  // atoms are rendered as vue component
  // <component :is="component" v-bind="attrs" />
  vname: string
  attrs: object
}



export type BlockNode = {
  renderKey: number
  type: string
  prev?: number
  next?: number
  parent?: number
  id: number | string
}


export const BlockRoot: BlockNode = {
  renderKey: 0,
  type: "doc-root",
  id: "root",
}

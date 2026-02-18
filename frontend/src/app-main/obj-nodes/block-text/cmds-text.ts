import type { BlockText, MarkType } from "../../block-text/text-inline"


export type Selection = {
  start: number
  end: number
  mark: MarkType
}



export function replaceText(node: BlockText, text: string, selection: Selection) {

}

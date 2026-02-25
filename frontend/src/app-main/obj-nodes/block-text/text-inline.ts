import { MarkType } from "./mark-inline"

//export type InlineType = InlineText | InlineAtom


export interface InlineType {
  type: "text" | "atom",
  [key: string]: any,

}

export type InlineText = InlineType & {
  type: "text",
  text: string,
  mark: MarkType;
}

export type InlineAtom = InlineType & {
  type: "atom",
  name: string,
  attrs: Record<string, any>;

}





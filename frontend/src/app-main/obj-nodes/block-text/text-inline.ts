import { MarkType } from "./mark-inline"

//export type InlineType = InlineText | InlineAtom


export interface InlineType {
  [key: string]: any,
  length(): number
}

export type InlineText = InlineType & {
  text: string;
  mark: MarkType;
}

export type InlineAtom = InlineType & {
  name: string;
  attrs: Record<string, any>;
}







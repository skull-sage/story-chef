import { MarkType } from "./mark-inline"

//export type InlineType = InlineText | InlineAtom


export interface InlineType {
  [key: string]: any,
  length(): number
}

export class InlineText implements InlineType {
  text: string;
  mark: MarkType;
  constructor(text: string, mark: MarkType) {
    this.text = text;
    this.mark = mark;
  }

  length() {
    return this.text.length;
  }
}

export class InlineAtom implements InlineType {
  name: string;
  attrs: Record<string, any>;
  constructor(name: string, attrs: Record<string, any>) {
    this.name = name;
    this.attrs = attrs;
  }

  length() {
    return 1;
  }
}





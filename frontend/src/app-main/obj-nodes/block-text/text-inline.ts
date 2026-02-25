import { MarkType } from "./mark-inline"

//export type InlineType = InlineText | InlineAtom


export interface InlineType {

  [key: string]: any,
  isText():boolean,
  length():number
}

export class InlineText implements InlineType {

  text: string;
  mark?: MarkType;

  constructor(text: string, mark?: MarkType) {
    this.text = text;
    this.mark = mark;
  }

  isText(): boolean {
    return true;
  }

  length(): number {
    return this.text.length;
  }
}

export class InlineAtom implements InlineType {

  name: string;
  attrs: Record<string, any>;

  constructor(name: string, attrs?: Record<string, any>) {
    this.name = name;
    this.attrs = attrs || {};
  }

  isText(): boolean {
    return false;
  }

  length(): number {
    return 1; // atoms are considered to have a length of 1
  }
}




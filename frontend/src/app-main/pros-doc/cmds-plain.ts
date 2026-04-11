import { toggleMark } from "prosemirror-commands";
import { Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";


type PlainCmdType = {
  keyMap: string;
  apply: (editor: EditorView) => Boolean;
  inputRule?: string;
  menuIcon?: string;
  menuLabel?: string;
}


export const PlainCmds: Record<string, PlainCmdType> = {
  bold: {
    keyMap: "Mod+b",
    apply: toggleMark(Schema.marks.bold),
    inputRule: "",
    menuIcon: "",
    menuLabel: ""
  }
}

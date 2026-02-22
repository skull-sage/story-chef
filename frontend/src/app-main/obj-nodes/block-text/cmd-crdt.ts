
import { MarkType } from "./mark-inline";
import { InlineText, InlineType } from "./text-inline";


function expand(fillArray: InlineType[], text: string, mark: MarkType) {
  // implement: each character of text is an InlineVal with the mark
  for (let i = 0; i < text.length; i++) {
    fillArray.push({ type: "text", text: text[i], mark: mark });
  }

}

function exapndInline(content: InlineType[], fromIdx: number, toIdx: number) {
  const expanded: InlineType[] = [];
  for (let i = fromIdx; i <= toIdx; i++) {
    if (content[i].type == 'atom') {
      expanded.push(content[i]);
    }
    if (content[i].type === "text") {
      const inline = content[i] as InlineText;
      expand(expanded, inline.text, inline.mark);
    }
    return expanded;
  }
}

function collapseInline(expanded: InlineType[]): InlineType[] {
  const newInlines: InlineType[] = [];


  for (let i = 0; i < expanded.length; i++) {
    const iv = expanded[i];

    if (iv.type == 'atom') {
      newInlines.push(iv);
      continue;
    }
    // type == ''text'
    const inline = iv as InlineText;
    let buf = "";
    let curMark = inline.mark;
    for (let j = i + 1; j < expanded.length; j++) {
      const next = expanded[j];
      if (next.type == 'atom') {
        break;
      }
      const inline = next as InlineText;
      if (inline.mark === curMark) {
        buf += inline.text;
      } else if (buf.length > 0) {
        newInlines.push({ type: "text", text: buf, mark: curMark });
        break;
      }
    }

  }
  return newInlines;
}

import type { InlineText, InlineAtom, InlineType } from "./text-inline"
import type { BlockText } from "./block-type"
import { TextSelection } from "./text-selection"
import { isMarkEqual, MarkType } from "./mark-inline";




// function expand(fillArray: InlineType[], text: string, mark: MarkType) {
//   // implement: each character of text is an InlineVal with the mark
//   for (let i = 0; i < text.length; i++) {
//     fillArray.push({ type: "text", text: text[i], mark: mark });
//   }

// }

// function exapndInline(content: InlineType[], fromIdx: number, toIdx: number) {
//   const expanded: InlineType[] = [];
//   for (let i = fromIdx; i <= toIdx; i++) {
//     if (content[i].type == 'atom') {
//       expanded.push(content[i]);
//     }
//     if (content[i].type === "text") {
//       const inline = content[i] as InlineText;
//       expand(expanded, inline.text, inline.mark);
//     }
//     return expanded;
//   }
// }

// function collapseInline(expanded: InlineType[]): InlineType[] {
//   const newInlines: InlineType[] = [];


//   for (let i = 0; i < expanded.length; i++) {
//     const iv = expanded[i];

//     if (iv.type == 'atom') {
//       newInlines.push(iv);
//       continue;
//     }
//     // type == ''text'
//     const inline = iv as InlineText;
//     let buf = "";
//     let curMark = inline.mark;
//     for (let j = i + 1; j < expanded.length; j++) {
//       const next = expanded[j];
//       if (next.type == 'atom') {
//         break;
//       }
//       const inline = next as InlineText;
//       if (inline.mark === curMark) {
//         buf += inline.text;
//       } else if (buf.length > 0) {
//         newInlines.push({ type: "text", text: buf, mark: curMark });
//         break;
//       }
//     }

//   }
//   return newInlines;
// }

export default {
  replaceText(node: BlockText, text: string, selection: TextSelection) {

  },

  insertAtom(node: BlockText, atom: InlineAtom, selection: TextSelection) {

  },

  toggleMark(node: BlockText, mark: MarkType, selection: TextSelection): boolean {
    const { start, end } = selection;
    const content = node.content;


    // if selection contains an atom, return false
    for (let i = start.inlineIdx; i <= end.inlineIdx; i++) {
      if (content[i].type === "atom") return false;
      if (isMarkEqual((content[i] as InlineText).mark, mark)) {
        mark = undefined // no need to apply the mark
      }
    }


    const newSegments: InlineType[] = [];
    let startItem = content[start.inlineIdx] as InlineText;
    let endItem = content[end.inlineIdx] as InlineText;

    let prefixSlice = startItem.text.slice(0, start.offset);
    if (prefixSlice)
      newSegments.push({ type: "text", text: prefixSlice, mark: startItem.mark });

    let contentSlice = startItem.text.slice(start.offset, startItem.text.length);
    for (let i = start.inlineIdx + 1; i < end.inlineIdx; i++) {
      let item = content[i] as InlineText
      contentSlice += item.text;
    }
    if (contentSlice) {
      newSegments.push({ type: "text", text: contentSlice, mark: mark });
    }

    let suffixSlice = endItem.text.slice(end.offset);
    if (suffixSlice)
      newSegments.push({ type: "text", text: suffixSlice, mark: endItem.mark });

    // splice new segments in place of the old range
    content.splice(start.inlineIdx, end.inlineIdx - start.inlineIdx + 1, ...newSegments);

    return true;
  }
  /*applyMark(node: BlockText, mark: MarkType, selection: TextSelection): boolean {
    const { start, end } = selection;
    const content = node.content;

    // Check if selection contains an InlineAtom — if so, return false
    for (let i = start.inlineIdx; i <= end.inlineIdx; i++) {
      if (content[i].type === "atom") return false;
    }

    // Expand selected InlineText items into a flat InlineVal[]
    const expanded: InlineType[] = exapndInline(content, start.inlineIdx, end.inlineIdx);

    // Determine which InlineVal indices fall within the selection range
    // Characters before start.offset (in first inline) and after end.offset (in last inline)
    // are outside the selection.
    const firstInlineLen = (content[start.inlineIdx] as InlineText).text.length;
    // Offset into expanded[] where the selection begins
    const selStart = start.offset;
    // Offset into expanded[] where the selection ends
    // All chars from inlines before end.inlineIdx contribute their full length
    let prefixLen = 0;
    for (let i = start.inlineIdx; i < end.inlineIdx; i++) {
      prefixLen += (content[i] as InlineText).text.length;
    }
    const selEnd = prefixLen + end.offset;

    // Apply the mark to each InlineVal in the selection range
    for (let i = selStart; i < selEnd; i++) {
      (expanded[i] as InlineText).mark = mark;
    }

    // Reconstruct InlineText segments from the expanded array by collapsing
    // consecutive characters with the same mark back into InlineText items
    const newInlines: InlineType[] = collapseInline(expanded);

    // Splice the new inline segments into node.content in place of the old range
    content.splice(start.inlineIdx, end.inlineIdx - start.inlineIdx + 1, ...newInlines);

    return true;
  }
*/

}



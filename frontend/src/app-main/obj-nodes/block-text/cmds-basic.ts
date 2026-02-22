import type { InlineText, InlineAtom, InlineType } from "./text-inline"
import type { BlockText } from "./block-type"
import { TextSelection } from "./text-selection"
import { isMarkEqual, MarkType } from "./mark-inline";
import { debug } from "console";


function copySlice(content: InlineType[], sel: TextSelection) {
  const { start, end } = sel;
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
  debugger;
  if (suffixSlice)
    newSegments.push({ type: "text", text: suffixSlice, mark: endItem.mark });

  return newSegments;
}


export default {
  replaceText(node: BlockText, text: string, selection: TextSelection) {

  },

  insertAtom(node: BlockText, atom: InlineAtom, selection: TextSelection) {

  },

  toggleMark(node: BlockText, mark: MarkType, selection: TextSelection): boolean {
    const { start, end } = selection;
    const content = node.content;

    // if selection contains an atom, we don't apply mark and return false
    // if selection contains a text with same mark,
    //we clear existing mark with undefined
    for (let i = start.inlineIdx; i <= end.inlineIdx; i++) {
      if (content[i].type === "atom") return false;
      else if (content[i].type === "text") {
        let item = content[i] as InlineText;
        if (isMarkEqual(item.mark, mark)) {
          mark = undefined;
        }
      }
    }


    const newSegments: InlineType[] = [];
    let startItem = content[start.inlineIdx] as InlineText;
    let endItem = content[end.inlineIdx] as InlineText;

    let prefixSlice = startItem.text.slice(0, start.offset);
    if (prefixSlice)
      newSegments.push({ type: "text", text: prefixSlice, mark: startItem.mark });

    let selectedSlice: string;
    if (start.inlineIdx == end.inlineIdx) {
      selectedSlice = startItem.text.slice(start.offset, end.offset);


    } else {

      selectedSlice = startItem.text.slice(start.offset, startItem.text.length);
      for (let i = start.inlineIdx + 1; i < end.inlineIdx; i++) {
        let item = content[i] as InlineText
        selectedSlice += item.text;
      }
      selectedSlice += endItem.text.slice(0, end.offset);
    }
    if (selectedSlice) {
      newSegments.push({ type: "text", text: selectedSlice, mark: mark });
    }

    let suffixSlice = endItem.text.slice(end.offset);
    if (suffixSlice)
      newSegments.push({ type: "text", text: suffixSlice, mark: endItem.mark });

    // splice new segments in place of the old range
    content.splice(start.inlineIdx, end.inlineIdx - start.inlineIdx + 1, ...newSegments);

    if (!node.renderKey) node.renderKey = 0
    node.renderKey++;

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



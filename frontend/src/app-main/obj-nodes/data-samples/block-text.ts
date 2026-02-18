import { BlockText } from "../block-text/block-type";


export function utilCalcInlineOffset(content) {
  let offset = 0;
  for (let inline of content) {
    inline.offset = offset; // it means the left-offset before it's starting
    if (inline.type == 'text') {
      offset += inline.text.length;
    } else if (inline.type == 'atom') {
      offset += 1;
    }
  }
}

export const basicSample: BlockText = {
  type: "block-text",
  id: 1,
  parent: 0,
  prev: null,
  next: null,
  content: [
    {
      type: "text",
      text: "Hello World! ",
    },
    {
      type: "text",
      text: "This is a highlighted text. ",
      mark: {
        type: "highlight",
        styleClz: "bg-line",
        color: "yellow",
      },
    },

    {
      type: "atom",
      name: "InputAtom", // Example component name
      attrs: { placeholder: "an atom" },
    },
    {
      type: "text",
      text: "! This is a test end.",
    },
  ],
}

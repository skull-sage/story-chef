import type { MarkSpec, NodeSpec } from "prosemirror-model"


export const nodeSpec: Record<string, NodeSpec> = {
  doc: {
    content: "block+",
  },
  text: {
    group: "inline",
  },
  block_text: {
    content: "inline*",
    attrs: {
      level: { default: "paragraph" } //  h1, h2, h3, regular
    },
    parseDOM: [
      { tag: "p", getAttrs: () => ({ level: 'paragraph' }) },
      { tag: 'h1', getAttrs: () => ({ level: 'title' }) },
      { tag: 'h2', getAttrs: () => ({ level: 'title_section' }) },
      { tag: 'h3', getAttrs: () => ({ level: 'title_subsection' }) },
    ],
    toDOM(node) {
      let { level } = node.attrs
      let tag = 'p'
      if (level === 'title') tag = 'h1'
      if (level === 'title_section') tag = 'h2'
      if (level === 'title_subsection') tag = 'h3'
      return [tag, 0]
    },
  },


}


export const markSpec: Record<string, MarkSpec> = {
  bold: {
    parseDOM: [
      { tag: "strong" },
      { tag: "b", getAttrs: (node: HTMLElement) => node.style.fontWeight !== "normal" && null },
      { style: "font-weight=400", clearMark: (m) => m.type.name === "bold" },
      { style: "font-weight", getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null },
    ],
    toDOM() { return ["strong", 0] },
  },

  em: {
    parseDOM: [
      { tag: "em" },
      { tag: "i" },
      { style: "font-style=italic" },
    ],
    toDOM() { return ["em", 0] },
  },

  highlight: {
    attrs: {
      inlineStyle: { default: undefined },
      styleClz: { default: undefined }, //
    },
    parseDOM: [
      {
        tag: "mark",
        getAttrs: (node: HTMLElement) => ({
          color: node.style.backgroundColor || "#FFFF00",
        }),
      },
    ],
    toDOM(mark) {
      if (mark.attrs.inlineStyle) {
        return ["mark", { style: mark.attrs.inlineStyle }, 0]
      }

      if (mark.attrs.styleClz) {
        return ["mark", { class: mark.attrs.styleClz }, 0]
      }

      return ["mark", 0]
    },
  },
}

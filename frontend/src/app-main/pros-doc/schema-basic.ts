
import type { NodeSpec } from "prosemirror-model"

export default {
  list: {
    content: "list_item+",
    attrs: {
      type: { default: "bullet" } //  bullet, ordered
    },
    parseDOM: [
      { tag: "ul", getAttrs: () => ({ type: 'bullet' }) },
      { tag: "ol", getAttrs: () => ({ type: 'ordered' }) },
    ],
    toDOM(node) {
      let { type } = node.attrs
      let tag = 'ul'
      if (type === 'ordered') tag = 'ol'
      return [tag, 0]
    },
  },

  list_item: {
    content: "inline*",
    parseDOM: [
      { tag: "li" },
    ],
    toDOM(node) {
      return ["li", 0]
    },
  }
}

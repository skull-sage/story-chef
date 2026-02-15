<script lang="ts">
import { defineComponent, h, resolveComponent, computed, ref, onMounted, onUnmounted } from "vue"
import type { BlockText } from "./block-type"
import type { MarkType } from "./text-inline"

export default defineComponent({
  name: "InputBlockText",
  props: {
    node: {
      type: Object as () => BlockText,
      required: false,
    },
  },
  emits: ["selection"],
  setup(props, { emit }) {
    // Default sample data if no prop is provided
    const sampleData: BlockText = {
      type: "block-text",
      id: 1,
      parent: 0,
      prev: 0,
      next: 0,
      content: [
        {
          type: "text",
          text: "Hello ",
        },
        {
          type: "text",
          text: "World",
          mark: {
            type: "highlight",
            styleClz: "bg-line",
            color: "yellow",
          },
        },
        {
          type: "text",
          text: "! This is a test with ",
        },
        {
          type: "atom",
          name: "InputAtom", // Example component name
          attrs: { placeholder: "an atom" },
        },
      ],
    }

    const blockNode = computed(() => props.node || sampleData)

    const root = ref<HTMLElement | null>(null)

    const getOffset = (
      userNode: Node | null,
      userOffset: number
    ): number | null => {
      if (!userNode || !root.value) return null
      // Check if node is inside root
      if (!root.value.contains(userNode)) return null

      let offset = 0
      const content = blockNode.value.content
      const children = Array.from(root.value.children)

      // If userNode is root, userOffset is the child index
      if (userNode === root.value) {
        for (let i = 0; i < userOffset && i < content.length; i++) {
          const item = content[i]
          offset += item.type === "text" ? item.text.length : 1
        }
        return offset
      }

      // Otherwise find which child contains userNode
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const item = content[i]
        const itemLength = item.type === "text" ? item.text.length : 1

        if (child.contains(userNode)) {
          // Found the child
          if (item.type === "atom") {
            // Atoms are treated as length 1
            return offset
          } else {
            // Text node
            if (userNode.nodeType === Node.TEXT_NODE) {
              return offset + userOffset
            }
            // If userNode is the SPAN itself
            if (userOffset === 0) return offset
            return offset + itemLength
          }
        }

        offset += itemLength
      }

      return null
    }

    const onSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || !root.value) return

      const { anchorNode, anchorOffset, focusNode, focusOffset } = selection

      const start = getOffset(anchorNode, anchorOffset)
      const end = getOffset(focusNode, focusOffset)

      if (start !== null && end !== null) {
        emit('selection', {
            start: Math.min(start, end),
            end: Math.max(start, end),
            anchor: start,
            focus: end
        })
      }
    }

    onMounted(() => {
        document.addEventListener('selectionchange', onSelectionChange)
    })

    onUnmounted(() => {
        document.removeEventListener('selectionchange', onSelectionChange)
    })

    return () => {
      return h(
        "div",
        {
          class: "input-block-text",
          contenteditable: true,
          ref: root,
        },
        blockNode.value.content.map((item, index) => {
          if (item.type === "text") {
            const mark = item.mark as MarkType | undefined
            const style: Record<string, string> = {}
            const classes: Record<string, boolean> = {}

            if (mark?.type === "highlight") {
              style.backgroundColor = mark.color
              //classes["has-highlight"] = true
              if (mark.styleClz) {
                classes[mark.styleClz] = true
              }
            }

            return h(
              "span", { key: index, class: classes, style: style}, item.text
            )
          } else if (item.type === "atom") {
            const component = resolveComponent(item.name)
            return h(component, {
              key: index,
              contenteditable: false,
              ...item.attrs
            })
          }
          return null
        })
      )
    }
  },
})
</script>

<style scoped>
.input-block-text {
  font-family: sans-serif;
  line-height: 1.5;
}

.has-highlight {
  border-radius: 2px;
  padding: 0 2px;
}
</style>

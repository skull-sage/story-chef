import type { BlockText, MarkType } from "./text-inline"


export type Selection = {
  start: number
  end: number
  mark: MarkType
}

export function replaceText(node: BlockText, text: string, selection: Selection) {
  if (node.type !== "block-text") {
    throw new Error("Invalid node type")
  }

  // node.content is array of TextNode and AtomNode
  // we need to replace the text between start and end with the new text
  // and keep the mark

  const { start, end, mark } = selection
  const newContent: (typeof node.content[number])[] = []

  let currentPos = 0
  let replacementInserted = false

  for (const item of node.content) {
    if (item.type === "atom") {
      // Atoms are treated as single characters
      const atomEnd = currentPos + 1

      if (atomEnd <= start || currentPos >= end) {
        // Atom is completely outside selection range
        newContent.push(item)
      } else if (!replacementInserted) {
        // Atom is within selection range, insert replacement text before removing it
        if (text.length > 0) {
          newContent.push({ type: "text", text, mark })
        }
        replacementInserted = true
      }

      currentPos = atomEnd
    } else {
      // TextNode
      const textLength = item.text.length
      const textEnd = currentPos + textLength

      if (textEnd <= start) {
        // Text is completely before selection
        newContent.push(item)
      } else if (currentPos >= end) {
        // Text is completely after selection
        if (!replacementInserted) {
          if (text.length > 0) {
            newContent.push({ type: "text", text, mark })
          }
          replacementInserted = true
        }
        newContent.push(item)
      } else {
        // Text overlaps with selection
        const beforeStart = Math.max(0, start - currentPos)
        const beforeEnd = Math.min(textLength, end - currentPos)

        // Add text before selection
        if (beforeStart > 0) {
          newContent.push({
            type: "text",
            text: item.text.substring(0, beforeStart),
            mark: item.mark
          })
        }

        // Insert replacement text
        if (!replacementInserted) {
          if (text.length > 0) {
            newContent.push({ type: "text", text, mark })
          }
          replacementInserted = true
        }

        // Add text after selection
        if (beforeEnd < textLength) {
          newContent.push({
            type: "text",
            text: item.text.substring(beforeEnd),
            mark: item.mark
          })
        }
      }

      currentPos = textEnd
    }
  }

  // If we haven't inserted replacement yet (selection was at/beyond end)
  if (!replacementInserted && text.length > 0) {
    newContent.push({ type: "text", text, mark })
  }

  node.content = newContent
}

# ProseMirror Commands — nin-doc Implementation Reference

A complete catalog of every command in `prosemirror-commands`, grouped by behavior category,
with the exact cases each one must handle for a well-behaved text editor.

> Schema context: `doc → block_text(inline*)` with marks: `bold`, `em`, `highlight`.
> `block_text` doubles as paragraph/h1/h2/h3 via the `level` attr.

---

## 1. Deletion Commands

### `deleteSelection`
Delete whatever is currently selected.

| Case | Behavior |
|------|----------|
| Selection is empty | Return `false` (no-op) |
| Inline text selected | Remove the selected text |
| Multi-block selection | Remove all selected content, merge boundary blocks |
| Node selected (NodeSelection) | Remove the entire node |

**Key binding:** part of `Backspace` / `Delete` chains.

---

### `joinBackward` ← primary Backspace behavior
Cursor at the **start** of a textblock → merge with the block before it.

| Case | Behavior |
|------|----------|
| Cursor not at block start | Return `false` |
| Block directly before; same/compatible type | Join the two blocks (content merges) |
| Block before is a different type but joinable | Try `deleteBarrier` — wrap, lift, or merge |
| No block before; block is inside a parent | Lift the block out of its parent |
| Previous block is an atom (non-editable node) | Delete the atom |
| Current block is empty, previous block is selectable | Delete current block, select previous node |
| Parent is `isolating` | Stop traversal at the isolating boundary |

---

### `joinTextblockBackward`
Narrower form of `joinBackward` — **only** joins textblocks, never lifts.

| Case | Behavior |
|------|----------|
| Cursor not at block start | Return `false` |
| Previous sibling is a textblock | Merge content of both textblocks at the deepest text level |
| No previous cut point | Return `false` |

---

### `joinForward` ← primary Delete behavior
Cursor at the **end** of a textblock → merge with the block after it.

| Case | Behavior |
|------|----------|
| Cursor not at block end | Return `false` |
| Block after; same/compatible type | Join them |
| Block after; different type | `deleteBarrier`: wrap after-block's content into before-block |
| No block after | Return `false` |
| Next block is an atom | Delete the atom |
| Current block is empty, next block is selectable | Delete current, select next node |

---

### `joinTextblockForward`
Narrower Delete — only merges textblocks.

| Case | Behavior |
|------|----------|
| Cursor not at block end | Return `false` |
| Next sibling is a textblock | Merge textblock content |

---

## 2. Node Selection Fallbacks

These fire **after** the primary deletion commands fail (schema won't allow a join).

### `selectNodeBackward`
When backspace can't delete, select the node before the cursor instead.

| Case | Behavior |
|------|----------|
| Selection is not empty | Return `false` |
| Cursor not at block start | Return `false` |
| Node before cursor is selectable | Create a `NodeSelection` on it |
| Node before is not selectable | Return `false` |

**Key chain order:** `deleteSelection → joinBackward → selectNodeBackward`

---

### `selectNodeForward`
The Delete equivalent of `selectNodeBackward`.

| Case | Behavior |
|------|----------|
| Selection is not empty | Return `false` |
| Cursor not at block end | Return `false` |
| Node after cursor is selectable | Create a `NodeSelection` on it |
| Node after is not selectable | Return `false` |

**Key chain order:** `deleteSelection → joinForward → selectNodeForward`

---

## 3. Enter / Line-break Commands

### `newlineInCode`
Insert a literal `\n` inside a `code` block (not a new block).

| Case | Behavior |
|------|----------|
| Parent node has `code: true` in spec | Insert `"\n"` at cursor |
| Selection spans multiple parents | Return `false` |
| Not inside a code block | Return `false` |

**Key binding:** first in the Enter chain.

---

### `createParagraphNear`
When a **block node** is selected, insert a paragraph nearby to give the cursor somewhere to go.

| Case | Behavior |
|------|----------|
| Selection is AllSelection | Return `false` |
| Selection's parent has inline content | Return `false` (already in text) |
| Block selected, it's the first child | Insert paragraph **before** it |
| Block selected, not first child | Insert paragraph **after** it |
| Schema doesn't allow a text block adjacent | Return `false` |

---

### `liftEmptyBlock`
Press Enter in an **empty** block that is nested → lift it out.

| Case | Behavior |
|------|----------|
| Cursor not present or block not empty | Return `false` |
| Block nested > 1 deep, not at parent end | Split the parent (dedent effect) |
| Block liftable to a shallower level | Lift it |
| Block cannot be lifted | Return `false` |

---

### `splitBlock` / `splitBlockAs(fn)`
The standard Enter: split the current block into two.

| Case | Behavior |
|------|----------|
| NodeSelection on a block node | Split at the node boundary |
| TextSelection with content | Delete selection first, then split |
| Cursor at very start of block | New empty block created before, cursor stays |
| Cursor in the middle | Content after cursor moves to new block |
| Cursor at end of block | New empty block created after |
| `splitBlockAs` with a custom fn | The new block's type/attrs come from the fn |
| Schema doesn't allow split | Try defaultBlockType; if still impossible, return `false` |
| At end of a heading (block_text level=title) | `splitBlockAs` can return `{type: block_text, attrs:{level:'paragraph'}}` to reset to paragraph |

---

### `splitBlockKeepMarks`
Same as `splitBlock` but the active marks carry over to the new block.

| Case | Behavior |
|------|----------|
| Stored marks exist on cursor | Apply them to the new block's start |
| No stored marks but parent marks exist | Preserve parent marks |
| Otherwise | Identical to `splitBlock` |

---

### `exitCode`
Press `Mod-Enter` inside a code block to jump out below it.

| Case | Behavior |
|------|----------|
| Inside a code block | Insert a default text block after; move cursor there |
| Not inside a code block | Return `false` |
| Schema doesn't allow a new block at that position | Return `false` |

---

## 4. Join Commands (explicit / toolbar)

### `joinUp`
Join the selected block with its **sibling above**.

| Case | Behavior |
|------|----------|
| NodeSelection on a non-textblock that can join | Join at `sel.from`; reselect the merged node |
| TextSelection | Find the closest ancestor join point upward |
| No join point found | Return `false` |

---

### `joinDown`
Join the selected block with its **sibling below**.

| Case | Behavior |
|------|----------|
| NodeSelection on a non-textblock | Join at `sel.to` |
| TextSelection | Find join point downward |
| No join point | Return `false` |

---

## 5. Lifting / Unwrapping

### `lift`
Remove the selected block from its parent wrapper.

| Case | Behavior |
|------|----------|
| Selection has a liftable block range | Lift to the target depth |
| Already at top level / no lift target | Return `false` |

**Use case in nin-doc:** "Remove from blockquote", dedent list item, etc.

---

### `liftEmptyBlock`
*(also in Enter chain — see §3)*

---

## 6. Wrapping

### `wrapIn(nodeType, attrs?)`
Wrap the selection in a container node.

| Case | Behavior |
|------|----------|
| Selection can be wrapped in `nodeType` | Wrap it |
| Schema doesn't allow wrapping here | Return `false` |

**Use case in nin-doc:** wrap in `blockquote`, `callout`, list wrapper, etc.

---

## 7. Block Type Conversion

### `setBlockType(nodeType, attrs?)`
Convert selected textblocks to a different node type.

| Case | Behavior |
|------|----------|
| All selected blocks already have target type+attrs | Return `false` (idempotent guard) |
| Schema allows replacement at each position | Apply `setBlockType` to each block in selection |
| No applicable block in selection | Return `false` |

**Use case in nin-doc:**
```ts
// paragraph → heading
setBlockType(schema.nodes.block_text, { level: 'title' })

// heading → paragraph  
setBlockType(schema.nodes.block_text, { level: 'paragraph' })
```

---

## 8. Mark Commands

### `toggleMark(markType, attrs?, options?)`
Toggle a mark on the selection (or on stored marks when cursor is collapsed).

| Case | Behavior |
|------|----------|
| Selection empty, cursor present | Toggle stored mark (affects next typed chars) |
| Mark already in **any** part of range | Remove it from entire range (`removeWhenPresent: true`, default) |
| Mark in **all** parts of range | With `removeWhenPresent: false`, add to missing parts |
| Selection contains atom nodes | Skip atom interiors unless `enterInlineAtoms: true` |
| Leading/trailing whitespace | Skip by default unless `includeWhitespace: true` |
| Mark not allowed by schema at any point | Return `false` |

**nin-doc marks:**
```ts
toggleMark(schema.marks.bold)          // Mod-b
toggleMark(schema.marks.em)            // Mod-i
toggleMark(schema.marks.highlight, { styleClz: 'yellow' })
```

---

## 9. Selection Manipulation

### `selectAll`
Select the entire document.

| Case | Behavior |
|------|----------|
| Always | Sets `AllSelection` on the doc |

**Key binding:** `Mod-a`

---

### `selectParentNode`
Expand selection to the wrapping node.

| Case | Behavior |
|------|----------|
| No shared depth (already at doc root) | Return `false` |
| Otherwise | `NodeSelection` on the shared ancestor |

---

### `selectTextblockStart`
Move cursor to the start of the current textblock.

| Case | Behavior |
|------|----------|
| Inside a textblock | Place cursor before first character |
| Not in a textblock | Return `false` |

**Mac binding:** `Ctrl-a`

---

### `selectTextblockEnd`
Move cursor to the end of the current textblock.

| Case | Behavior |
|------|----------|
| Inside a textblock | Place cursor after last character |
| Not in a textblock | Return `false` |

**Mac binding:** `Ctrl-e`

---

## 10. Composition Utilities

### `chainCommands(...cmds)`
Try each command in order; return `true` on first success.

```ts
// The standard Backspace chain:
chainCommands(deleteSelection, joinBackward, selectNodeBackward)

// The standard Delete chain:
chainCommands(deleteSelection, joinForward, selectNodeForward)

// The standard Enter chain:
chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock)
```

---

### `autoJoin(command, isJoinable)`
Wrap a command so that adjacent same-type nodes produced by the command are automatically joined.

| Case | Behavior |
|------|----------|
| Command produces adjacent joinable siblings | Join them after dispatch |
| Command fails or produces no adjacency | Pass through unchanged |

**Use case:** wrapping a "toggle list" command so multiple list items don't float apart.

---

## 11. Base Keymaps

### `pcBaseKeymap`
```
Enter         → newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock
Mod-Enter     → exitCode
Backspace     → deleteSelection, joinBackward, selectNodeBackward
Mod-Backspace → (same as Backspace)
Shift-Backspace → (same as Backspace)
Delete        → deleteSelection, joinForward, selectNodeForward
Mod-Delete    → (same as Delete)
Mod-a         → selectAll
```

### `macBaseKeymap` (extends pcBaseKeymap)
```
Ctrl-h              → Backspace chain
Alt-Backspace       → Mod-Backspace chain
Ctrl-d              → Delete chain
Ctrl-Alt-Backspace  → Mod-Delete chain
Alt-Delete          → Mod-Delete chain
Alt-d               → Mod-Delete chain
Ctrl-a              → selectTextblockStart
Ctrl-e              → selectTextblockEnd
```

---

## 12. Commands NOT in prosemirror-commands (need custom impl)

These are essential for a complete editor but live in other packages or need custom code:

| Command | Source / Notes |
|---------|---------------|
| `undo` / `redo` | `prosemirror-history` → `undo`, `redo` |
| Indent list item | `prosemirror-schema-list` → `sinkListItem` |
| Dedent list item | `prosemirror-schema-list` → `liftListItem` |
| Insert list item | `prosemirror-schema-list` → `splitListItem` |
| Wrap in bullet list | `prosemirror-schema-list` → `wrapInList` |
| Input rules (e.g., `**bold**`) | `prosemirror-inputrules` |
| Word-jump (Alt-Arrow) | Custom: scan for word boundary, move selection |
| Hard break (Shift-Enter) | `insertText("\n")` inside non-code blocks or insert a `hard_break` node |
| Tab / Shift-Tab | Custom: indent/dedent in lists; insert `\t` in code |
| Clear formatting | Custom: remove all marks in selection range |
| Copy/paste as plain text | Clipboard serialization in EditorView |
| Link toggle | Custom `toggleMark` or `setMark` with `href` attr |
| Find & Replace | Fully custom — no ProseMirror builtin |

---

## 13. nin-doc Specific Implementation Checklist

Given schema `doc → block_text(inline*)` with `level` attr:

- [ ] **Enter in heading** → `splitBlockAs` returning `{type: block_text, attrs: {level:'paragraph'}}`
- [ ] **Enter keeps marks** → use `splitBlockKeepMarks` or clear per design choice
- [ ] **Backspace across heading boundary** → `joinBackward` handles it; ensure `block_text` compat check
- [ ] **Mod-b / Mod-i** → `toggleMark` for `bold` / `em`
- [ ] **Mod-shift-h** or toolbar → `setBlockType` cycling through levels
- [ ] **Mod-a** → `selectAll`
- [ ] **Escape** → `selectParentNode` or blur — custom decision
- [ ] **Cmd/Ctrl+Z** → undo from `prosemirror-history`
- [ ] **Tab in future lists** → `sinkListItem` / `liftListItem`

import { Ref } from 'vue';
import { BlockText } from '../text-types';
import { type TextSelection, calcTextLocalSelection } from '../text-selection';
import CmdsText, { FlatContent } from '../cmds-basic';
import { markForKey } from '../keybindings';
import { parseClipboardText } from '../clipboard-parse';

/**
 * Composable that encapsulates all event handling for a block-text editor node.
 *
 * @param node   - getter returning the reactive BlockText node
 * @param rootRef - ref to the root contenteditable HTMLElement
 */
export function useBlockTextEvents(
  node: () => BlockText,
  rootRef: Ref<HTMLElement | null>,
) {
  let selectionState: TextSelection = undefined;

  // ─── Selection ────────────────────────────────────────────────────────────

  const onSelectionChange = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      selectionState = undefined;
      return;
    }
    selectionState = calcTextLocalSelection(
      sel,
      rootRef.value.children,
      node().content,
    );
  };

  // ─── Mouse ────────────────────────────────────────────────────────────────

  const onMouseup = () => {
    console.log('#selection on mouse-up:', selectionState);
    if (selectionState) {
      FlatContent.expand(node().content).log(selectionState.from, selectionState.to);
    }
  };

  // ─── Keyboard ─────────────────────────────────────────────────────────────

  const onKeydown = (e: KeyboardEvent) => {
    // Ctrl+V — paste clipboard as plain text
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      const sel = selectionState;
      if (!sel) return;
      navigator.clipboard.readText().then((raw) => {
        const parsed = parseClipboardText(raw);
        if (!parsed.length) return;
        CmdsText.replaceText(node(), parsed[0].text, sel);
      });
      return;
    }

    // Mark shortcuts (bold, italic, etc.)
    const mark = markForKey(e);
    if (mark) {
      e.preventDefault();
      console.log(e, mark);
      const sel = selectionState;
      if (!sel) return;
      CmdsText.applyMark(node(), mark, sel);
      return;
    }

    // Backspace — delete selection or char before cursor
    if (e.key === 'Backspace') {
      e.preventDefault();
      const sel = selectionState;
      if (!sel) return;
      if (sel.from === sel.to) {
        if (sel.from === 0) return;
        CmdsText.replaceText(node(), '', { ...sel, from: sel.from - 1 });
      } else {
        CmdsText.replaceText(node(), '', sel);
      }
      return;
    }

    // Delete — delete selection or char after cursor
    if (e.key === 'Delete') {
      e.preventDefault();
      const sel = selectionState;
      if (!sel) return;
      if (sel.from === sel.to) {
        CmdsText.replaceText(node(), '', { ...sel, to: sel.to + 1 });
      } else {
        CmdsText.replaceText(node(), '', sel);
      }
      return;
    }

    // Printable character — insert/overwrite at selection
    // e.key.length === 1 excludes arrows, F-keys, Enter, Tab, etc.
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const sel = selectionState;
      if (!sel) return;
      CmdsText.replaceText(node(), e.key, sel);
      return;
    }
  };

  return { onSelectionChange, onMouseup, onKeydown };
}

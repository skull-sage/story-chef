import cmdsBasic from './cmds-basic';
import { COMMON_MARK, type MarkType } from './text-types';

/**
 * Maps a Ctrl+<key> combination to the mark it should toggle.
 * Returns undefined if the keystroke is not a registered shortcut.
 */
export function markForKey(e: KeyboardEvent): MarkType | undefined {
    if (!e.ctrlKey) return undefined;

    switch (e.key) {
        case 'h': return { type: 'highlight', styleClz: 'bg-line', color: '#ffe066' };
        case 'u': return { type: 'highlight', styleClz: 'uline', color: '#ffe066' };
        case 'b': return { type: 'format', format: 'bold' };
        case 'i': return { type: 'format', format: 'italic' };
        default: return undefined;
    }
}

export  handleKeyMap(keymap: string, editor: any) {
  switch (keymap) {
    case 'ctrl+h': ()=>cmdsBasic.applyMark(editor, COMMON_MARK.hl_bgline),
    case 'ctrl+u': return COMMON_MARK.uline;
    case 'ctrl+b': return COMMON_MARK.bold;
    case 'ctrl+i': return COMMON_MARK.italic;
    default: return undefined;
  }
}

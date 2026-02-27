import type { MarkType } from './text-types';

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

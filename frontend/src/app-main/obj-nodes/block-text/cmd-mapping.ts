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


export const DEFAULTS_CMDS = {
  bold :  cmdsBasic.makeApplyMark(COMMON_MARK.bold),
  italic : cmdsBasic.makeApplyMark(COMMON_MARK.italic),
  underline : cmdsBasic.makeApplyMark(COMMON_MARK.hl_uline),
  highlight : cmdsBasic.makeApplyMark(COMMON_MARK.hl_bgline),
  code : cmdsBasic.makeApplyMark(COMMON_MARK.code),
  h1: cmdsBasic.makeApplyMark({type:'format', format:'h1'}),
  h2: cmdsBasic.makeApplyMark({type:'format', format:'h2'}),
  h3: cmdsBasic.makeApplyMark({type:'format', format:'h3'}),
}

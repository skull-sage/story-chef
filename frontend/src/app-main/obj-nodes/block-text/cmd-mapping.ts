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
  bold: cmdsBasic.makeApplyMark(COMMON_MARK.bold),
  italic: cmdsBasic.makeApplyMark(COMMON_MARK.italic),
  underline: cmdsBasic.makeApplyMark(COMMON_MARK.hl_uline),
  highlight: cmdsBasic.makeApplyMark(COMMON_MARK.hl_bgline),
  code: cmdsBasic.makeApplyMark(COMMON_MARK.code),
  h1: cmdsBasic.makeApplyAttr({ level: 'h1' }),
  h2: cmdsBasic.makeApplyAttr({ level: 'h2' }),
  h3: cmdsBasic.makeApplyAttr({ level: 'h3' }),
  paragraph: cmdsBasic.makeApplyAttr({ level: 'paragraph' }),
  alignLeft: cmdsBasic.makeApplyAttr({ align: 'left' }),
  alignCenter: cmdsBasic.makeApplyAttr({ align: 'center' }),
  alignRight: cmdsBasic.makeApplyAttr({ align: 'right' }),
}



export const KEY_MAPPING = {
  'Ctrl+b': DEFAULTS_CMDS.bold,
  'Ctrl+i': DEFAULTS_CMDS.italic,
  'Ctrl+h': DEFAULTS_CMDS.highlight,
  'Ctrl+u': DEFAULTS_CMDS.underline,
  'Ctrl+v': cmdsBasic.makeClipboardText(),
  'Backspace': cmdsBasic.makeDeleteLeft(),
  'Ctrl+1': DEFAULTS_CMDS.h1,
  'Ctrl+2': DEFAULTS_CMDS.h2,
  'Ctrl+3': DEFAULTS_CMDS.h3,
  'Ctrl+p': DEFAULTS_CMDS.paragraph,
  'Ctrl+l': DEFAULTS_CMDS.alignLeft,
  'Ctrl+e': DEFAULTS_CMDS.alignCenter
}

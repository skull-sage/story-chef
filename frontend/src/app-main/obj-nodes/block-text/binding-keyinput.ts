
import { KEY_MAPPING } from "./cmd-mapping";
import CmdsText from "./cmds-text";
import NinStore from "./nin-store";
import { TextSelection } from "./text-selection";



export class KeyBinding {
  ninStore: NinStore;
  onKeyDown: (e: KeyboardEvent) => void;
  constructor(ninStore: NinStore) {
    if (!ninStore) throw new Error('ninStore is required');
    this.ninStore = ninStore;
    this.onKeyDown = (e: KeyboardEvent) => {
      this.#handleKeyDown(e);
    };
  }

  #handleKeyDown(e: KeyboardEvent) {

    const keyStr = e.key;
    const sel: TextSelection = this.ninStore.calcDomSelection();
    const hasModifier = e.ctrlKey || e.altKey || e.metaKey;

    // won't handle any hot/action keys other than backspace
    if (keyStr.length > 1 && keyStr !== 'Backspace') return;
    // won't handle any key input for empty selection
    if (!hasModifier && sel.isCollapsed) return;

    if (keyStr == 'Backspace') {
      e.preventDefault();
      CmdsText.makeDeleteLeft()(this.ninStore);
      return;
    }

    // Modifier + key combo  (Ctrl+A, Ctrl+Shift+Z, etc.)
    if (hasModifier) {
      let keyCombos = keyStr;
      if (e.ctrlKey) keyCombos = 'Ctrl+' + keyStr;
      if (e.altKey) keyCombos = 'Alt+' + keyStr;
      if (e.shiftKey) keyCombos = 'Shift+' + keyStr;
      if (e.metaKey) keyCombos = 'Meta+' + keyStr;

      const cmd = KEY_MAPPING[keyCombos];
      if (cmd) {
        e.preventDefault();
        cmd(this.ninStore);
      }
      return;
    }


  }

  mount() {
    this.ninStore.elm.addEventListener('keydown', this.onKeyDown);
  }

  unmount() {
    this.ninStore.elm.removeEventListener('keydown', this.onKeyDown);
  }
}

import { FlatSelection, TextSelection } from "./text-selection";
import { InlineType } from "./text-types";

type Command = (content: InlineType[], selection: any) => any;
type SelectionChangeListener = (selection: TextSelection) => void;


export class TextDoc{
  textContent: InlineType[];
  flatSelection : FlatSelection;

  selChangeListeners: (() => void)[] = [];

  applyChange(content:InlineType[], selection:FlatSelection){
    this.textContent = content;
    this.flatSelection = selection;
    this.notifySelectionChange();
  }

  onSelectionChange(listener: () => void){
    this.selChangeListeners.push(listener);
  }

  notifySelectionChange(){
    this.selChangeListeners.forEach(listener => listener());
  }

}

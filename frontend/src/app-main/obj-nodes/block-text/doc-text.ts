import { FlatSelection, TextSelection } from "./text-selection";
import { InlineType } from "./text-types";

type Command = (doc:DocText) => any;
type SelectionChangeListener = (selection: FlatSelection) => void;


export class DocText{
  textContent: InlineType[];
  flatSelection : FlatSelection;

  onSelectionChange: SelectionChangeListener;

  onDomSelection(selection:Selection){

  }

  applyChange(content:InlineType[], selection:FlatSelection){
    this.textContent = content;
    this.flatSelection = selection;
    this.onSelectionChange(this.flatSelection);
  }

  adjustDomSelection(){
    // Adjust DOM selection based on flatSelection
  }

}

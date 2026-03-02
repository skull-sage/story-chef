import { BlockTextSelection } from "./text-selection";
import { BlockText, InlineType } from "./text-types";

type Command = (doc:DocText) => any;
type SelectionChangeListener = (selection: BlockTextSelection) => void;

export class BlockTextPatch{

  setAttr(attrs:Object){

  }

  setContent(content: InlineType[]){

  }

  setSelection(selection:BlockTextSelection){

  }

  apply(node:BlockText){

  }
}

export class DocText{
   state: {
    node:BlockText,
    selection:BlockTextSelection
   };

  onSelectionChange: SelectionChangeListener;

  onDomSelection(selection:Selection){

  }

  $path(patchFunc: (state)=>void){
      patchFunc(this.state);
  }

  adjustDomSelection(){
    // Adjust DOM selection based on flatSelection
  }

}

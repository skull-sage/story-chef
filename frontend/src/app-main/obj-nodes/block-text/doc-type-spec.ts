import { TextSelection } from "./text-selection";
import { BlockText, InlineType, MarkType } from "./text-types";

//# A sample spec that we might want to work on during doc editor implementation
// it seems we will end up with same thing prosemirror has done. :)
// avoided export keyword for future use.

type BlockNode = {
  type: string;
  attrs: Object;
  ref : {
    id: number; // clockID
    prev: number; // sibling before
    next: number; // sibling after
    parent: number; // parent node
    firstChild: number; // first child node
  }
}

class NinDoc{
  #nodeMap: Map<number, BlockNode>;
  node(id:number){
    return this.#nodeMap.get(id);
  }

  root(){
    return this.#nodeMap.get(0);
  }


}

type Command = (docState : DocState)=>Boolean;


class Transaction {
  changeList: {type: string, nodeId: number, [key:string]: any}[] = [];
  constructor(){

  }

  $patchAttr(nodeId : number, attr:Object){
    this.changeList.push({type: 'attr', nodeId, attr});
  }

  $patchInlineContent(nodeId:number, content:InlineType[], {from, to}:TextSelection){
      // patch content of a block node
      this.changeList.push({type: 'inline_content', nodeId, content, from, to});
  }



}

interface DocState {
   selection: TextSelection;
   doc: BlockText | NinDoc;

}

const mark_curry = (mark:MarkType)=>{
  return (docState:DocState)=>{
    // apply mark to docState.doc
  }
}


// a sample of how would CMDS work with doc state
 const DEFAULTS_CMDS = {
  bold :  mark_curry({type:'format', format:'bold'}),
  italic : mark_curry({type:'format', format:'italic'}),
  underline : mark_curry({type:'highlight', styleClz:'uline', color:'#ffe066'}),
  highlight : mark_curry({type:'highlight', styleClz:'bg-line', color:'#ffe066'}),
  code : mark_curry({type:'format', format:'code'}),
}





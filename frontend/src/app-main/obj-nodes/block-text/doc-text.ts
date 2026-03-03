import { TextSelection } from "./text-selection";
import { BlockText, InlineType, MarkType } from "./text-types";

type Command = (node:BlockText, selection:TextSelection)=>void;

type CmdMap = {
  cmdFunc: Command,
  keyComb: string,
  menuIcon: string,
  menuLabel: string,
}

const mark_curry = (mark:MarkType)=>{
  return (node:BlockText, selection:TextSelection)=>{
    // apply mark to node
  }
}

export const CMD_MAP = {
  bold :  mark_curry({type:'format', format:'bold'}),
  italic : mark_curry({type:'format', format:'italic'}),
  underline : mark_curry({type:'highlight', styleClz:'uline', color:'#ffe066'}),
  highlight : mark_curry({type:'highlight', styleClz:'bg-line', color:'#ffe066'}),
  code : mark_curry({type:'format', format:'code'}),
}

CMD_MAP.bold.apply();

export class DocText{
   node: BlockText ;  
   selection?: TextSelection;

   constructor(node: BlockText) {
    this.node = node; 
  }





}



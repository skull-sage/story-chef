
import { BlockText, InlineType } from "./text-types";
import { adjustTextLocalSelection, calcTextLocalSelection, TextSelection } from "./text-selection";



 function sanitize(node : BlockText) : BlockText{

    if(node== undefined || node.content == undefined)
      return {id:undefined, attrs: { level: 'paragraph', align: 'left', color: null }, content:[]}

    const newContent: InlineType[] = [];
    for (let idx = 0; idx < node.content.length; idx++) {
      let item:InlineType = node.content[idx];
      const validInline = ('text' in item && item.text) || ('name' in item);
      if (validInline) {
          newContent.push(item);
        } else {
          console.warn(`item ${idx} of Block Text is not a valid InlineType:{InlineText, InlineAtom}`);
        }
    }
    return {content : newContent, id: node.id, attrs: { ...node.attrs }};
};


export class DocText{
  dataNode : BlockText;
  domElm : HTMLElement;
  selection: TextSelection;
  emitChange : ()=>void;

  constructor(dataNode: BlockText, domElm: HTMLElement){
    this.dataNode = sanitize(dataNode);
    this.domElm = domElm;
    this.selection = undefined;
  }

  itemLen(idx:number){
    if(idx > this.dataNode.content.length)
      return 0;
    const item = this.dataNode.content[idx]
    // we only allow atom or text with non-empty string, so we can safely calculate length
    const len = 'text' in item ? item.text.length: 1;
    return len;

  }

  calcDocSelection(sel: Selection) {
    this.selection = calcTextLocalSelection(sel, this.domElm, this.dataNode);
  }


  $patchAttr(attr: Object){
    for (const key in attr) {
      this.dataNode.attrs[key] = attr[key];
    }
    this.emitChange();
  }

  $patchContent(content:InlineType[], {from, to} : {from: number, to:number}){
    this.dataNode.content = content;
    if(from && to){
      // the selection are supposed to be in sync with data node
      adjustTextLocalSelection(this.domElm, from, to)
    }
    // adjust dom selection according to from and to
  }


}

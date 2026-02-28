
type Command = (node: any, selection: any) => any;


export class DocEditor{
  node: any;
  selection : any;
  execute(Command: Command){
    let node = DocEditor.clone(this.node);
    let selection = DocEditor.clone(this.selection);
    Command(node, selection);

  }

  static clone(obj: any) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      const arrCopy: any[] = [];
      for (let i = 0; i < obj.length; i++) {
        arrCopy[i] = this.clone(obj[i]);
      }
      return arrCopy;
    }
}

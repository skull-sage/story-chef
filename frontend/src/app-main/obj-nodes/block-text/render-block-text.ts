import { InlineItem, InlineText, InlineAtom, BlockText } from "./text-types";
import { AppContext, Fragment, h } from 'vue';

const inlineTag = {
  format: {
    bold: 'strong',
    italic: 'em',
    code: 'code',
  },
  highlight: 'mark',
}

const levelTag = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  paragraph: 'p',
}

const renderText = (item: InlineText) => {
  if (!item.mark)
    return item.text;

  let tag;
  if (item.mark.type == 'format') {
    tag = inlineTag.format[item.mark.format];
    return h(tag, item.text);
  } else if (item.mark.type == 'highlight') {
    tag = inlineTag.highlight;
    return h(tag, { class: item.mark.styleClz, style: { backgroundColor: item.mark.color } }, item.text);
  }

  return h('span', item.text);
  /*
  we handle link tag later
  else if (item.mark.type == 'link') {
     tag = 'a';
  }*/
}

export function renderContent(content: InlineItem[]) {

  if (content.length == 0) {
    return h('br');
  }

  return content.map((item) => {
    if ('text' in item) {
      return renderText(item as InlineText);
    } else {
      // render atom to be implemented
      //return renderAtom(item as InlineAtom);
    }
  });
}

export function renderNode({ attrs, content }: BlockText, appContext: AppContext) {
  const contentNodes = renderContent(content);
  const { level, align, bgColor, txtColor } = attrs;
  const tag = levelTag[level];
  return h(tag, { style: { textAlign: align, backgroundColor: bgColor, color: txtColor } }, contentNodes);
}

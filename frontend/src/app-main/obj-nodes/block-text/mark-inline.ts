

export interface MarkType {
  type: string
  [key: string]: any
}


export class MarkPool {
  private static encodeMap: Record<string, (mark: MarkType) => string> = {}
  private static markDict: Record<string, MarkType> = {}

  static eq(markA: MarkType, markB: MarkType): boolean {
    if (markA === markB)
      return true
    for (const key in markA) {
      if (markA[key] !== markB[key])
        return false
    }
    return true
  }

  static register(type: string, encoder: (mark: MarkType) => string) {
    MarkPool.encodeMap[type] = encoder
  }

  static get(mark: MarkType): MarkType {
    const encoder = MarkPool.encodeMap[mark.type]
    if (encoder) {
      const key = encoder(mark)
      if (MarkPool.markDict[key]) {
        return MarkPool.markDict[key]
      } else {
        MarkPool.markDict[key] = mark
        return mark
      }
    }
    return mark
  }

}


export type MarkFormat = MarkType & {
  type: "format",
  format: "bold" | "italic" | "code",
}

MarkPool.register("format", (mark: MarkFormat) => {
  return `${mark.type}:${mark.format}`
})

export type MarkLink = MarkType & {
  type: "link"
  href: string,
  title: string,
  target: string,
  rel: string,
}

export function isMarkEqual(markA: MarkType, markB: MarkType): boolean {
  if (markA === markB)
    return true
  for (const key in markA) {
    if (markA[key] !== markB[key])
      return false
  }
  return true
}

export type MarkHighlight = MarkType & {
  type: "highlight"
  styleClz: string // uline | h-uline | bg-line | h-bg-line | h-circle
  color: string
}

MarkPool.register("highlight", (mark: MarkHighlight) => {
  return `${mark.type}:${mark.styleClz}:${mark.color}`
})

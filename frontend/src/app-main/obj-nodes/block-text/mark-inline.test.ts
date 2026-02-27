import { describe, it, expect, beforeEach } from 'vitest'
import {
  MarkPool,
  MarkType,
  MarkFormat,
  MarkHighlight,
  MarkLink,
} from './text-types'

// ---------------------------------------------------------------------------
// Helpers to reset MarkPool's private static state between tests so that
// one test's cached marks don't bleed into the next.
// ---------------------------------------------------------------------------
function resetMarkPool() {
  // Access private statics through type-casting – acceptable in unit tests.
  const pool = MarkPool as any
  pool.encodeMap = {}
  pool.markDict = {}
}

// ---------------------------------------------------------------------------
// Re-register the built-in encoders after reset (mirrors mark-inline.ts)
// ---------------------------------------------------------------------------
function registerBuiltins() {
  MarkPool.register('format', (mark: MarkType) => {
    const m = mark as MarkFormat
    return `${m.type}:${m.format}`
  })
  MarkPool.register('highlight', (mark: MarkType) => {
    const m = mark as MarkHighlight
    return `${m.type}:${m.styleClz}:${m.color}`
  })
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('MarkPool.eq', () => {
  it('returns true for the exact same object reference', () => {
    const a: MarkType = { type: 'format', format: 'bold' }
    expect(MarkPool.eq(a, a)).toBe(true)
  })

  it('returns true when two distinct objects have identical properties', () => {
    const a: MarkType = { type: 'bold' }
    const b: MarkType = { type: 'bold' }
    expect(MarkPool.eq(a, b)).toBe(true)
  })

  it('returns false when types differ (distinct objects)', () => {
    const a: MarkType = { type: 'x' }
    const b: MarkType = { type: 'y' }
    expect(MarkPool.eq(a, b)).toBe(false)
  })

  it('returns false when a shared key has different values', () => {
    const a: MarkType = { type: 'highlight', color: 'red' }
    const b: MarkType = { type: 'highlight', color: 'blue' }
    expect(MarkPool.eq(a, b)).toBe(false)
  })

  it('returns false when format values differ (distinct objects)', () => {
    // No longer short-circuits on type — full property comparison is done
    const a: MarkFormat = { type: 'format', format: 'bold' }
    const b: MarkFormat = { type: 'format', format: 'italic' }
    expect(MarkPool.eq(a, b)).toBe(false)
  })

  it('returns true when format values are identical (distinct objects)', () => {
    const a: MarkFormat = { type: 'format', format: 'code' }
    const b: MarkFormat = { type: 'format', format: 'code' }
    expect(MarkPool.eq(a, b)).toBe(true)
  })
})

// ---------------------------------------------------------------------------

describe('MarkPool.register', () => {
  beforeEach(() => {
    resetMarkPool()
  })

  it('registers an encoder without throwing', () => {
    expect(() => {
      MarkPool.register('custom', (mark) => mark.type)
    }).not.toThrow()
  })

  it('overwrites an existing encoder when re-registered', () => {
    MarkPool.register('custom', (_mark) => 'v1')
    MarkPool.register('custom', (_mark) => 'v2')

    const mark: MarkType = { type: 'custom' }
    // First call caches the mark with the new encoder's key
    const result = MarkPool.get(mark)
    expect(result).toBe(mark) // first insertion stores and returns the mark
  })
})

// ---------------------------------------------------------------------------

describe('MarkPool.get – no registered encoder', () => {
  beforeEach(() => {
    resetMarkPool()
  })

  it('returns the original mark object when no encoder is registered', () => {
    const mark: MarkType = { type: 'unknown' }
    expect(MarkPool.get(mark)).toBe(mark)
  })
})

// ---------------------------------------------------------------------------

describe('MarkPool.get – deduplication / caching', () => {
  beforeEach(() => {
    resetMarkPool()
    registerBuiltins()
  })

  it('returns the SAME object reference for identical format marks (bold)', () => {
    const bold1: MarkFormat = { type: 'format', format: 'bold' }
    const bold2: MarkFormat = { type: 'format', format: 'bold' }

    const ref1 = MarkPool.get(bold1)
    const ref2 = MarkPool.get(bold2)

    expect(ref1).toBe(ref2) // same cached reference
  })

  it('returns the first-inserted object as the canonical reference', () => {
    const first: MarkFormat = { type: 'format', format: 'italic' }
    const second: MarkFormat = { type: 'format', format: 'italic' }

    const ref1 = MarkPool.get(first)
    const ref2 = MarkPool.get(second)

    expect(ref1).toBe(first)
    expect(ref2).toBe(first) // second call returns the cached first object
  })

  it('treats different format values as distinct marks', () => {
    const bold: MarkFormat = { type: 'format', format: 'bold' }
    const italic: MarkFormat = { type: 'format', format: 'italic' }
    const code: MarkFormat = { type: 'format', format: 'code' }

    const r1 = MarkPool.get(bold)
    const r2 = MarkPool.get(italic)
    const r3 = MarkPool.get(code)

    expect(r1).not.toBe(r2)
    expect(r2).not.toBe(r3)
    expect(r1).not.toBe(r3)
  })
})

// ---------------------------------------------------------------------------

describe('MarkPool.get – MarkFormat (bold / italic / code)', () => {
  beforeEach(() => {
    resetMarkPool()
    registerBuiltins()
  })

  it('caches and retrieves a bold mark correctly', () => {
    const bold: MarkFormat = { type: 'format', format: 'bold' }
    const cached = MarkPool.get(bold)
    expect(cached.type).toBe('format')
    expect((cached as MarkFormat).format).toBe('bold')
  })

  it('caches and retrieves an italic mark correctly', () => {
    const italic: MarkFormat = { type: 'format', format: 'italic' }
    const cached = MarkPool.get(italic)
    expect((cached as MarkFormat).format).toBe('italic')
  })

  it('caches and retrieves a code mark correctly', () => {
    const code: MarkFormat = { type: 'format', format: 'code' }
    const cached = MarkPool.get(code)
    expect((cached as MarkFormat).format).toBe('code')
  })
})

// ---------------------------------------------------------------------------

describe('MarkPool.get – MarkHighlight', () => {
  beforeEach(() => {
    resetMarkPool()
    registerBuiltins()
  })

  it('returns the same reference for identical highlight marks', () => {
    const h1: MarkHighlight = { type: 'highlight', styleClz: 'bg-line', color: '#ff0' }
    const h2: MarkHighlight = { type: 'highlight', styleClz: 'bg-line', color: '#ff0' }

    expect(MarkPool.get(h1)).toBe(MarkPool.get(h2))
  })

  it('distinguishes highlights by styleClz', () => {
    const h1: MarkHighlight = { type: 'highlight', styleClz: 'uline', color: '#f00' }
    const h2: MarkHighlight = { type: 'highlight', styleClz: 'h-uline', color: '#f00' }

    expect(MarkPool.get(h1)).not.toBe(MarkPool.get(h2))
  })

  it('distinguishes highlights by color', () => {
    const h1: MarkHighlight = { type: 'highlight', styleClz: 'uline', color: '#f00' }
    const h2: MarkHighlight = { type: 'highlight', styleClz: 'uline', color: '#0f0' }

    expect(MarkPool.get(h1)).not.toBe(MarkPool.get(h2))
  })

  it('stores all five styleClz variants independently', () => {
    const styles = ['uline', 'h-uline', 'bg-line', 'h-bg-line', 'h-circle'] as const
    const refs = styles.map((s) =>
      MarkPool.get({ type: 'highlight', styleClz: s, color: '#abc' } as MarkHighlight)
    )
    const unique = new Set(refs)
    expect(unique.size).toBe(styles.length)
  })
})

// ---------------------------------------------------------------------------

describe('MarkPool.get – MarkLink (no encoder registered by default)', () => {
  beforeEach(() => {
    resetMarkPool()
    registerBuiltins() // link has NO built-in encoder
  })

  it('returns the original link mark object (pass-through, no caching)', () => {
    const link1: MarkLink = { type: 'link', href: 'https://example.com', title: 'Example', target: '_blank', rel: 'noreferrer' }
    const link2: MarkLink = { type: 'link', href: 'https://example.com', title: 'Example', target: '_blank', rel: 'noreferrer' }

    // No encoder → both calls return their own object (no dedup)
    expect(MarkPool.get(link1)).toBe(link1)
    expect(MarkPool.get(link2)).toBe(link2)
    expect(MarkPool.get(link1)).not.toBe(link2)
  })

  it('can register a link encoder to enable deduplication', () => {
    MarkPool.register('link', (mark: MarkType) => {
      const m = mark as MarkLink
      return `link:${m.href}:${m.target}`
    })

    const link1: MarkLink = { type: 'link', href: 'https://a.com', title: 'A', target: '_blank', rel: '' }
    const link2: MarkLink = { type: 'link', href: 'https://a.com', title: 'A', target: '_blank', rel: '' }

    expect(MarkPool.get(link1)).toBe(MarkPool.get(link2))
  })
})

// ---------------------------------------------------------------------------

describe('MarkPool – cross-type isolation', () => {
  beforeEach(() => {
    resetMarkPool()
    registerBuiltins()
  })

  it('a format mark and a highlight mark are never the same reference', () => {
    const fmt: MarkFormat = { type: 'format', format: 'bold' }
    const hl: MarkHighlight = { type: 'highlight', styleClz: 'uline', color: '#000' }

    expect(MarkPool.get(fmt)).not.toBe(MarkPool.get(hl))
  })
})

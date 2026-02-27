import { InlineText, InlineType } from "./text-types";

/**
 * Parses a plain-text clipboard string into an array of InlineType nodes.
 * Each resulting node is a plain InlineText with no mark applied.
 */
export function parseClipboardText(raw: string): InlineType[] {
  if (!raw) return [];
  return [{ text: raw, mark: undefined } as InlineText];
}

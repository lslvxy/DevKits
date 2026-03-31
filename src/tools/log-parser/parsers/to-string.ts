import type { LogParser, ParseResult } from "./types.ts";

// Matches: ClassName@hexHash[ or ClassName[ or ClassName{
// Also supports package-qualified: com.example.ClassName@abc[
const TOSTRING_START_RE = /^(?:[a-zA-Z_$][\w$]*\.)*[A-Z][a-zA-Z_$\d]*(?:@[0-9a-fA-F]+)?[\[{]/;

export const ToStringParser: LogParser = {
  name: "ToStringParser",
  detect(input: string): number {
    return TOSTRING_START_RE.test(input.trim()) ? 0.8 : 0;
  },
  parse(input: string): ParseResult {
    try {
      const result = parseToStringValue(input.trim());
      if (result === null) {
        return {
          success: false,
          data: null,
          raw: input,
          parserName: "ToStringParser",
          confidence: 0,
          error: "无法解析 toString 格式",
        };
      }
      return {
        success: true,
        data: result as Record<string, unknown>,
        raw: input,
        parserName: "ToStringParser",
        confidence: 0.8,
      };
    } catch (e) {
      return {
        success: false,
        data: null,
        raw: input,
        parserName: "ToStringParser",
        confidence: 0,
        error: e instanceof Error ? e.message : "toString parse error",
      };
    }
  },
};

/**
 * Parse a toString value. Returns a Record if it's an object, or a primitive/array otherwise.
 */
export function parseToStringValue(
  input: string
): Record<string, unknown> | unknown[] | string | number | boolean | null {
  const t = input.trim();

  // null values
  if (t === "null" || t === "<null>") return null;
  // boolean
  if (t === "true") return true;
  if (t === "false") return false;
  // number
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)) return Number(t);

  // Try JSON first for { or [
  if (t.startsWith("{") || t.startsWith("[")) {
    try {
      return JSON.parse(t) as Record<string, unknown>;
    } catch {
      // fall through to toString map parsing
    }
  }

  // Java Date format: Mon Jan 01 00:00:00 CST 2024
  if (/^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{2}:\d{2}:\d{2} \w+ \d{4}$/.test(t)) {
    return t;
  }

  // Check for className@hash[ or className[ or className{
  const objMatch = t.match(
    /^((?:[a-zA-Z_$][\w$]*\.)*[A-Z][a-zA-Z_$\d]*)(?:@([0-9a-fA-F]+))?([\[{])(.*)/s
  );
  if (!objMatch) {
    return t; // plain string
  }

  const [, className, hash, openBracket, rest] = objMatch;
  const closeChar = openBracket === "[" ? "]" : "}";

  // Find the matching close bracket for the outermost object
  const inner = extractUntilClose(rest, closeChar);
  if (inner === null) return t;

  const fields = parseFields(inner);
  const obj: Record<string, unknown> = {
    _class: className,
    ...(hash ? { _hash: hash } : {}),
  };

  for (const [k, v] of fields) {
    obj[k] = parseToStringValue(v);
  }

  return obj;
}

/**
 * Extract the content up to (but not including) the matching close bracket.
 * Handles nested brackets.
 */
function extractUntilClose(text: string, closeChar: string): string | null {
  const openChar = closeChar === "]" ? "[" : "{";
  let depth = 1;
  let i = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  while (i < text.length) {
    const ch = text[i];

    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    } else if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    } else if (!inSingleQuote && !inDoubleQuote) {
      if (ch === openChar || ch === "[" || ch === "{" || ch === "(") {
        depth++;
      } else if (ch === closeChar || ch === "]" || ch === "}" || ch === ")") {
        depth--;
        if (depth === 0) {
          return text.slice(0, i);
        }
      }
    }
    i++;
  }
  return null;
}

/**
 * Parse key=value pairs from a toString body.
 * Handles , or ; separators, detected by first top-level separator encountered.
 */
function parseFields(body: string): [string, string][] {
  if (!body.trim()) return [];

  // Detect separator: scan for first top-level comma or semicolon
  const sep = detectSeparator(body);

  // Split by separator at depth 0
  const parts = splitAtDepth0(body, sep);
  const result: [string, string][] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) {
      result.push([trimmed, trimmed]);
    } else {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      result.push([key, value]);
    }
  }

  return result;
}

function detectSeparator(body: string): "," | ";" {
  let depth = 0;
  let inSQ = false;
  let inDQ = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "'" && !inDQ) inSQ = !inSQ;
    else if (ch === '"' && !inSQ) inDQ = !inDQ;
    else if (!inSQ && !inDQ) {
      if (ch === "[" || ch === "{" || ch === "(") depth++;
      else if (ch === "]" || ch === "}" || ch === ")") depth--;
      else if (depth === 0 && (ch === "," || ch === ";")) {
        return ch;
      }
    }
  }
  return ",";
}

function splitAtDepth0(body: string, sep: "," | ";"): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inSQ = false;
  let inDQ = false;
  let start = 0;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "'" && !inDQ) inSQ = !inSQ;
    else if (ch === '"' && !inSQ) inDQ = !inDQ;
    else if (!inSQ && !inDQ) {
      if (ch === "[" || ch === "{" || ch === "(") depth++;
      else if (ch === "]" || ch === "}" || ch === ")") depth--;
      else if (depth === 0 && ch === sep) {
        parts.push(body.slice(start, i));
        start = i + 1;
      }
    }
  }
  parts.push(body.slice(start));
  return parts;
}

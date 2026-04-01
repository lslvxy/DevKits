import { createChain } from "./chain.ts";
import { FallbackParser } from "./fallback.ts";
import { JsonDetectParser } from "./json-detect.ts";
import { KVParser } from "./kv.ts";
import { ToStringParser } from "./to-string.ts";
import { postProcess } from "./composite-data.ts";
import { parseValue } from "./recursive-descent.ts";
import type { LogParser, ParseResult } from "./types.ts";

// Sub-chain for parsing the message portion
const messageChain = createChain([JsonDetectParser, ToStringParser, KVParser, FallbackParser]);

// Logback / Log4j pattern:
// 2024-01-01 12:00:00.000 [thread] LEVEL com.example.Class - message
// 2024-01-01 12:00:00,000 [thread] LEVEL com.example.Class - [trace=xxx] message
const LOG_LINE_RE =
  /^(\d{4}-\d{2}-\d{2}[T ][\d:.]+(?:,\d+)?)\s+\[([^\]]*)\]\s+(\w+)\s+([\w$.]+)\s+-\s+(.*)/s;

export const LogFrameworkParser: LogParser = {
  name: "LogFrameworkParser",
  detect(input: string): number {
    return LOG_LINE_RE.test(input.trim()) ? 0.9 : 0;
  },
  parse(input: string): ParseResult {
    const m = input.trim().match(LOG_LINE_RE);
    if (!m) {
      return {
        success: false,
        data: null,
        raw: input,
        parserName: "LogFrameworkParser",
        confidence: 0,
        error: "日志行格式不匹配",
      };
    }

    const [, timestamp, thread, level, logger, rest] = m;

    // Extract traceContext like [traceId=xxx, spanId=yyy] at start of message
    const traceRe = /^\[([^\]]+)\]\s*(.*)/s;
    const traceMatch = rest.match(traceRe);
    let traceContext: string[] = [];
    let message = rest;

    if (traceMatch) {
      traceContext = traceMatch[1].split(",").map((s) => s.trim());
      message = traceMatch[2];
    }

    // Extract trailing key=<complex_value> pairs from the message body.
    // e.g. "End execute groovy script, result=CompositeData [...]"
    // e.g. "End [FcProd].(method). result=ProductResult[...]"
    const { text, kvPairs } = extractTrailingKV(message.trim());

    let messageData: Record<string, unknown>;

    if (kvPairs.length > 0) {
      // Build from extracted kv pairs
      const pairs: Record<string, unknown> = {};
      for (const [k, v] of kvPairs) {
        pairs[k] = postProcess(parseValue(v));
      }
      if (text) {
        pairs._text = text;
      }
      messageData = pairs;
    } else {
      // Fallback: parse the whole message body
      const messageResult = messageChain(message.trim());
      messageData =
        messageResult.success && messageResult.data
          ? messageResult.data
          : { raw: message };
    }

    const data: Record<string, unknown> = {
      timestamp,
      thread,
      level,
      logger,
      ...(traceContext.length > 0 ? { traceContext } : {}),
      message: messageData,
    };

    return {
      success: true,
      data,
      raw: input,
      parserName: "LogFrameworkParser",
      confidence: 0.9,
    };
  },
};

// ---------------------------------------------------------------------------
// Extract trailing complex key=value pairs from a message string.
//
// Strategy: scan right-to-left for patterns like "key=ClassName[" or "key={" or "key=["
// then walk forward using depth matching to find the full value.
// Multiple pairs may exist, separated by ", " or "; ".
// ---------------------------------------------------------------------------

type KVExtractResult = {
  text: string;
  kvPairs: [string, string][];
};

/**
 * Find all trailing key=complexValue pairs in a message.
 * Returns { text: prefix before the first kv pair, kvPairs: [[key, rawValue], ...] }
 */
function extractTrailingKV(message: string): KVExtractResult {
  // Pattern: word chars followed by '=' followed by a complex value starter
  // Complex value: ClassName[, ClassName{, [, {
  const KV_START_RE =
    /(\w+)=((?:[a-zA-Z_$][\w$.]*\s*[\[{]|\[|\{))/g;

  let bestMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;

  // Find the first occurrence that covers a complete balanced value to end-of-string
  while ((match = KV_START_RE.exec(message)) !== null) {
    const valueStart = match.index + match[1].length + 1; // after the '='
    const raw = message.slice(valueStart);
    if (isFullValue(raw)) {
      bestMatch = match;
      break;
    }
  }

  if (!bestMatch) {
    return { text: message, kvPairs: [] };
  }

  // Split from the bestMatch position onwards into multiple kv pairs
  const kvStart = bestMatch.index;
  const text = message.slice(0, kvStart).replace(/[,;]\s*$/, "").trim();
  const kvSegment = message.slice(kvStart);

  const kvPairs = splitKVSegment(kvSegment);
  return { text, kvPairs };
}

/**
 * Check if the string starts with a complete balanced value (object or list).
 */
function isFullValue(s: string): boolean {
  const t = s.trim();
  const openChar = t[0];
  if (!openChar) return false;

  // If it starts with a className, skip past it
  let i = 0;
  const classMatch = t.match(/^(?:[a-zA-Z_$][\w$.]*)\s*/);
  if (classMatch) {
    i = classMatch[0].length;
  }

  const ch = t[i];
  if (ch !== "[" && ch !== "{") return false;

  let depth = 0;
  for (; i < t.length; i++) {
    if (t[i] === "[" || t[i] === "{") depth++;
    else if (t[i] === "]" || t[i] === "}") {
      depth--;
      if (depth === 0) return true;
    }
  }
  return false;
}

/**
 * Split a segment like "result=Foo[...], success=true" into [[key, rawValue], ...]
 * by walking character-by-character and respecting bracket depth.
 */
function splitKVSegment(segment: string): [string, string][] {
  const pairs: [string, string][] = [];
  let pos = 0;

  while (pos < segment.length) {
    // skip whitespace and separators between pairs
    while (pos < segment.length && /[\s,;]/.test(segment[pos])) pos++;
    if (pos >= segment.length) break;

    // read key
    const keyStart = pos;
    while (pos < segment.length && segment[pos] !== "=") pos++;
    if (pos >= segment.length) break;
    const key = segment.slice(keyStart, pos).trim();
    pos++; // skip '='

    // read value: either complex (bracket-balanced) or simple (until `,` / `;` / end)
    const valStart = pos;
    // skip optional className before bracket
    const classMatch = segment.slice(pos).match(/^(?:[a-zA-Z_$][\w$.]*)\s*/);
    let afterClass = pos + (classMatch ? classMatch[0].length : 0);

    const firstBracket = segment[afterClass];
    if (firstBracket === "[" || firstBracket === "{") {
      // consume up to matching close
      let depth = 0;
      while (pos < segment.length) {
        const ch = segment[pos];
        if (ch === "[" || ch === "{") depth++;
        else if (ch === "]" || ch === "}") {
          depth--;
          if (depth === 0) { pos++; break; }
        }
        pos++;
      }
    } else {
      // simple value: read until comma/semicolon at depth 0
      while (pos < segment.length && segment[pos] !== "," && segment[pos] !== ";") pos++;
    }

    pairs.push([key, segment.slice(valStart, pos).trim()]);
  }

  return pairs;
}

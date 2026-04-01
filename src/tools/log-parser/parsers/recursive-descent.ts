/**
 * Recursive Descent Parser for Java toString() output.
 *
 * Grammar:
 *   value      := null | object | list | primitive
 *   null       := "null" | "<null>"
 *   object     := className WS? ('[' fields(';'|',') ']' | '{' fields(';'|',') '}')
 *   list       := '[' (value (',' value)*)? ']'   -- no className prefix
 *   fields     := (field sep)* field sep?
 *   field      := key '=' value
 *   primitive  := chars up to next structural char at depth 0
 *   className  := javaIdent ('.' javaIdent)*
 */

const JAVA_DATE_RE =
  /^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{2}:\d{2}:\d{2} \w+ \d{4}/;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ParsedObject extends Record<string, ParsedValue> {}
export type ParsedValue = null | boolean | number | string | ParsedObject | ParsedValue[];

/** Entry point: parse a full toString value string. */
export function parseValue(src: string): ParsedValue {
  const p = new Parser(src.trim());
  const v = p.value();
  return v;
}

// ---------------------------------------------------------------------------
// Core parser
// ---------------------------------------------------------------------------

class Parser {
  private pos = 0;

  constructor(private readonly src: string) {}

  private get cur(): string {
    return this.src[this.pos] ?? "";
  }

  private advance(): string {
    return this.src[this.pos++] ?? "";
  }

  private skipWS(): void {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) {
      this.pos++;
    }
  }

  // -------------------------------------------------------------------------
  // value  := null | bool | object | list | primitive
  // -------------------------------------------------------------------------
  value(): ParsedValue {
    this.skipWS();

    // <null>
    if (this.src.startsWith("<null>", this.pos)) {
      this.pos += 6;
      return null;
    }
    // null keyword (not a className prefix like "nullable")
    if (this.src.startsWith("null", this.pos)) {
      const after = this.src[this.pos + 4] ?? "";
      if (after === "" || /[,;\]}\s]/.test(after)) {
        this.pos += 4;
        return null;
      }
    }
    // true
    if (this.src.startsWith("true", this.pos)) {
      const after = this.src[this.pos + 4] ?? "";
      if (after === "" || /[,;\]}\s]/.test(after)) {
        this.pos += 4;
        return true;
      }
    }
    // false
    if (this.src.startsWith("false", this.pos)) {
      const after = this.src[this.pos + 5] ?? "";
      if (after === "" || /[,;\]}\s]/.test(after)) {
        this.pos += 5;
        return false;
      }
    }

    // List without class prefix: starts with '['
    if (this.cur === "[") {
      return this.list();
    }

    // Might be className followed by '[' or '{': look ahead
    const classNameEnd = this.tryClassName();
    if (classNameEnd !== -1) {
      return this.object(classNameEnd);
    }

    // primitive
    return this.primitive();
  }

  // -------------------------------------------------------------------------
  // Try to detect a className starting at pos.
  // Returns the position *after* the className (including optional @hash),
  // before the optional WS and bracket. Returns -1 if not a className pattern.
  // -------------------------------------------------------------------------
  private tryClassName(): number {
    const start = this.pos;
    let i = start;

    // First segment must start with uppercase letter (Java class convention)
    // OR be a lowercase package prefix followed by dots then uppercase class
    if (!/[a-zA-Z_$]/.test(this.src[i] ?? "")) return -1;

    // Read: (javaIdent '.')* javaIdent  — last segment must start with uppercase
    let lastSegStart = i;
    while (i < this.src.length) {
      const segStart = i;
      if (!/[a-zA-Z_$]/.test(this.src[i] ?? "")) break;
      while (i < this.src.length && /[\w$]/.test(this.src[i])) i++;
      if (i === segStart) break;
      lastSegStart = segStart;

      if (this.src[i] === ".") {
        i++;
        continue;
      }
      break;
    }

    if (i === start) return -1;

    // Last segment must start uppercase
    if (!/[A-Z]/.test(this.src[lastSegStart] ?? "")) return -1;

    // Optional @hexHash
    if (this.src[i] === "@") {
      i++;
      const hashStart = i;
      while (i < this.src.length && /[0-9a-fA-F]/.test(this.src[i])) i++;
      if (i === hashStart) i--;
    }

    // After className(@hash)?, skip optional whitespace
    let j = i;
    while (j < this.src.length && /\s/.test(this.src[j])) j++;

    // Must be followed by '[' or '{'
    if (this.src[j] !== "[" && this.src[j] !== "{") return -1;

    return i;
  }

  // -------------------------------------------------------------------------
  // object := className(@hash)? WS? ('[' fields ']' | '{' fields '}')
  // classNameEnd = pos after last char of className+hash
  // -------------------------------------------------------------------------
  private object(classNameEnd: number): Record<string, ParsedValue> {
    const full = this.src.slice(this.pos, classNameEnd);
    this.pos = classNameEnd;
    this.skipWS();

    const open = this.advance(); // '[' or '{'
    const close = (open === "[" ? "]" : "}") as "]" | "}";

    // Split full into className and optional hash
    const atIdx = full.indexOf("@");
    const className = atIdx === -1 ? full : full.slice(0, atIdx);
    const hash = atIdx === -1 ? undefined : full.slice(atIdx + 1);

    const sep = this.detectSep(close);
    const fields = this.fields(sep, close);
    if (this.cur === close) this.advance();

    const obj: Record<string, ParsedValue> = { _class: className };
    if (hash) obj._hash = hash;
    for (const [k, v] of fields) {
      obj[k] = v;
    }
    return obj;
  }

  // -------------------------------------------------------------------------
  // list := '[' (value (',' value)*)? ']'
  // Called when the '[' is NOT preceded by a className.
  // -------------------------------------------------------------------------
  private list(): ParsedValue[] {
    this.advance(); // consume '['
    const items: ParsedValue[] = [];

    this.skipWS();
    if (this.cur === "]") {
      this.advance();
      return items;
    }

    while (this.pos < this.src.length) {
      this.skipWS();
      if (this.cur === "]") break;

      items.push(this.value());
      this.skipWS();

      if (this.cur === ",") {
        this.advance();
      } else {
        break;
      }
    }

    this.skipWS();
    if (this.cur === "]") this.advance();
    return items;
  }

  // -------------------------------------------------------------------------
  // fields := (key '=' value sep)* — inside an object
  // -------------------------------------------------------------------------
  private fields(sep: string, close: string): [string, ParsedValue][] {
    const result: [string, ParsedValue][] = [];

    while (this.pos < this.src.length) {
      this.skipWS();
      if (this.cur === close || this.cur === "") break;

      // trailing separator before close: e.g. "chargeTargets=RECEIVER,;"
      if (this.cur === sep) {
        this.advance();
        continue;
      }

      // Read key
      const key = this.readUntil("=", close, sep);
      if (key === null || this.cur !== "=") break;
      this.advance(); // consume '='

      // Read value
      const val = this.value();
      result.push([key.trim(), val]);

      this.skipWS();
      if (this.cur === sep) {
        this.advance();
      } else {
        break;
      }
    }
    return result;
  }

  /**
   * Detect whether this object uses ',' or ';' as field separator.
   * Scans forward at depth 0 (without consuming characters) looking for
   * the first ',' or ';' before the close bracket.
   */
  private detectSep(close: "]" | "}"): "," | ";" {
    let depth = 0;
    let i = this.pos;
    while (i < this.src.length) {
      const ch: string = this.src[i] ?? "";
      if (ch === "[" || ch === "{" || ch === "(") depth++;
      else if (ch === "]" || ch === "}" || ch === ")") {
        if (depth === 0) break;
        depth--;
      } else if (depth === 0) {
        if (ch === close) break;
        if (ch === "," || ch === ";") return ch;
      }
      i++;
    }
    return ",";
  }

  // -------------------------------------------------------------------------
  // primitive := chars until next structural delimiter at depth 0
  //   → attempts coercion to number; booleans already handled in value()
  // -------------------------------------------------------------------------
  private primitive(): string | number {
    // Check for Java Date at current position:
    // e.g. "Fri Oct 13 12:41:00 SAST 2023"
    const remaining = this.src.slice(this.pos);
    const dateMatch = remaining.match(JAVA_DATE_RE);
    if (dateMatch) {
      this.pos += dateMatch[0].length;
      return dateMatch[0];
    }

    let result = "";
    let depth = 0;

    while (this.pos < this.src.length) {
      const ch = this.src[this.pos];

      if (ch === "[" || ch === "{" || ch === "(") {
        depth++;
        result += ch;
        this.pos++;
      } else if (ch === "]" || ch === "}" || ch === ")") {
        if (depth === 0) break;
        depth--;
        result += ch;
        this.pos++;
      } else if (depth === 0 && (ch === "," || ch === ";")) {
        break;
      } else {
        result += ch;
        this.pos++;
      }
    }

    const trimmed = result.trim();
    // Coerce to number if it looks numeric
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }
    return trimmed;
  }

  // -------------------------------------------------------------------------
  // Read characters up to (but not including) one of the stop chars at depth 0
  // -------------------------------------------------------------------------
  private readUntil(...stops: string[]): string | null {
    let result = "";
    let depth = 0;
    const stopSet = new Set(stops);

    while (this.pos < this.src.length) {
      const ch = this.src[this.pos];
      if (ch === "[" || ch === "{" || ch === "(") depth++;
      else if (ch === "]" || ch === "}" || ch === ")") {
        if (depth === 0 && stopSet.has(ch)) break;
        if (depth > 0) depth--;
        else break;
      } else if (depth === 0 && stopSet.has(ch)) break;
      result += ch;
      this.pos++;
    }
    return result;
  }
}

/**
 * Post-processor: unwrap wrapper objects.
 *
 * Pattern matched:
 *   Field[value=X, attr=null]  →  X
 *   Any object where every non-_class field except "value" is null/absent  →  value
 *
 * Also flattens CompositeData[children={...}] by hoisting children fields.
 *
 * Usage: apply recursively after parsing.
 */

import type { ParsedValue } from "./recursive-descent.ts";

/** Recursively unwrap Field wrappers and flatten CompositeData. */
export function postProcess(val: ParsedValue): ParsedValue {
  if (val === null || typeof val !== "object") return val;

  if (Array.isArray(val)) {
    return val.map(postProcess);
  }

  const obj = val as Record<string, ParsedValue>;

  // CompositeData[children={...}]  →  flatten children values
  if (obj._class === "CompositeData" && obj.children !== null && typeof obj.children === "object" && !Array.isArray(obj.children)) {
    const children = obj.children as Record<string, ParsedValue>;
    const result: Record<string, ParsedValue> = {};
    for (const [k, v] of Object.entries(children)) {
      result[k] = postProcess(v);
    }
    return result;
  }

  // Field[value=X, attr=null]  →  unwrap to X
  if (isFieldWrapper(obj)) {
    return postProcess(obj.value as ParsedValue);
  }

  // Recurse into fields
  const out: Record<string, ParsedValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = postProcess(v);
  }
  return out;
}

/**
 * A "Field wrapper" is an object (typically _class="Field") where:
 *   - it has a "value" key
 *   - all other non-_class/_hash keys are null
 */
function isFieldWrapper(obj: Record<string, ParsedValue>): boolean {
  if (!("value" in obj)) return false;
  const otherKeys = Object.keys(obj).filter((k) => k !== "_class" && k !== "_hash" && k !== "value");
  return otherKeys.every((k) => obj[k] === null);
}

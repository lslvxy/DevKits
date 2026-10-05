import { toolResult } from "../../../core/toolResult.ts";

export type TextOperation =
  | "unique"
  | "sort"
  | "reverse-sort"
  | "trim"
  | "remove-empty"
  | "upper"
  | "lower"
  | "affix";

export function processText(input: string, operation: TextOperation, prefix = "", suffix = "") {
  return toolResult(() => {
    if (!input) return "";
    if (operation === "upper") return input.toUpperCase();
    if (operation === "lower") return input.toLowerCase();
    const lines = input.split(/\r\n|\n|\r/);
    // A terminal line separator is not an additional empty record.
    const trailing = /[\r\n]$/.test(input);
    if (trailing) lines.pop();
    let output: string[];
    switch (operation) {
      case "unique":
        output = [...new Set(lines)];
        break;
      case "sort":
        output = lines.sort((a, b) => a.localeCompare(b));
        break;
      case "reverse-sort":
        output = lines.sort((a, b) => b.localeCompare(a));
        break;
      case "trim":
        output = lines.map((line) => line.trim());
        break;
      case "remove-empty":
        output = lines.filter((line) => line.trim().length > 0);
        break;
      case "affix":
        output = lines.map((line) => prefix + line + suffix);
        break;
      default:
        throw new Error("Unknown operation");
    }
    return output.join("\n") + (trailing && output.length ? "\n" : "");
  });
}

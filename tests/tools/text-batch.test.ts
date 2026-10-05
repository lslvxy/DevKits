import { describe, expect, it } from "vitest";
import { processText } from "../../src/tools/text-batch/parsers/textBatch.ts";

describe("text batch", () => {
  it("preserves first occurrences and a terminal newline", () => {
    expect(processText("b\r\na\r\nb\r\n", "unique")).toEqual({ success: true, data: "b\na\n" });
  });
  it("removes whitespace-only records", () => {
    expect(processText("a\n \n\nb", "remove-empty")).toEqual({ success: true, data: "a\nb" });
  });
  it("adds literal affixes without interpreting replacement syntax", () => {
    expect(processText("a\nb", "affix", "$&", "\\")).toEqual({
      success: true,
      data: "$&a\\\n$&b\\",
    });
  });
});

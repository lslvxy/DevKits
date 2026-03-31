import { describe, expect, it } from "vitest";
import { FallbackParser } from "../../src/tools/log-parser/parsers/fallback.ts";

describe("FallbackParser", () => {
  it("always returns confidence 0.1", () => {
    expect(FallbackParser.detect("anything")).toBe(0.1);
    expect(FallbackParser.detect("")).toBe(0.1);
  });

  it("always succeeds and wraps raw", () => {
    const result = FallbackParser.parse("some log line");
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ raw: "some log line" });
    expect(result.parserName).toBe("FallbackParser");
    expect(result.confidence).toBe(0.1);
  });
});

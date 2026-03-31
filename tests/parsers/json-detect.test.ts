import { describe, expect, it } from "vitest";
import { JsonDetectParser } from "../../src/tools/log-parser/parsers/json-detect.ts";

describe("JsonDetectParser", () => {
  it("detects valid JSON object with confidence 1.0", () => {
    expect(JsonDetectParser.detect('{"key":"value"}')).toBe(1.0);
  });

  it("detects valid JSON array with confidence 1.0", () => {
    expect(JsonDetectParser.detect("[1,2,3]")).toBe(1.0);
  });

  it("returns 0 for non-JSON input", () => {
    expect(JsonDetectParser.detect("hello world")).toBe(0);
  });

  it("returns 0 for invalid JSON starting with {", () => {
    expect(JsonDetectParser.detect("{invalid}")).toBe(0);
  });

  it("parses JSON object correctly", () => {
    const result = JsonDetectParser.parse('{"a":1,"b":"hello"}');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ a: 1, b: "hello" });
    expect(result.parserName).toBe("JsonDetectParser");
    expect(result.confidence).toBe(1.0);
  });

  it("parses JSON array and wraps in items", () => {
    const result = JsonDetectParser.parse("[1,2,3]");
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ items: [1, 2, 3] });
  });

  it("returns failure for invalid JSON", () => {
    const result = JsonDetectParser.parse("{invalid}");
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
  });
});

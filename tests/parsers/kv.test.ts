import { describe, expect, it } from "vitest";
import { KVParser } from "../../src/tools/log-parser/parsers/kv.ts";

describe("KVParser", () => {
  it("detects KV pairs with confidence 0.5", () => {
    expect(KVParser.detect("user=alice age=25 city=NY")).toBe(0.5);
  });

  it("returns 0 for single KV pair", () => {
    expect(KVParser.detect("user=alice")).toBe(0);
  });

  it("returns 0 for non-KV input", () => {
    expect(KVParser.detect("just some text")).toBe(0);
  });

  it("parses multiple key=value pairs", () => {
    const result = KVParser.parse("user=alice age=25 city=NY");
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      user: "alice",
      age: 25,
      city: "NY",
    });
    expect(result.parserName).toBe("KVParser");
    expect(result.confidence).toBe(0.5);
  });

  it("handles null values", () => {
    const result = KVParser.parse("key1=null key2=value");
    expect(result.success).toBe(true);
    expect(result.data?.key1).toBeNull();
  });

  it("handles boolean values", () => {
    const result = KVParser.parse("active=true disabled=false count=5");
    expect(result.success).toBe(true);
    expect(result.data?.active).toBe(true);
    expect(result.data?.disabled).toBe(false);
    expect(result.data?.count).toBe(5);
  });

  it("returns failure for insufficient KV pairs", () => {
    const result = KVParser.parse("onlyone=value");
    expect(result.success).toBe(false);
  });
});

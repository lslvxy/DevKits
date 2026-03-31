import { describe, expect, it } from "vitest";
import { createChain } from "../../src/tools/log-parser/parsers/chain.ts";
import { FallbackParser } from "../../src/tools/log-parser/parsers/fallback.ts";
import { JsonDetectParser } from "../../src/tools/log-parser/parsers/json-detect.ts";
import { KVParser } from "../../src/tools/log-parser/parsers/kv.ts";
import { LogFrameworkParser } from "../../src/tools/log-parser/parsers/log-framework.ts";
import { ToStringParser } from "../../src/tools/log-parser/parsers/to-string.ts";

const autoChain = createChain([
  JsonDetectParser,
  LogFrameworkParser,
  ToStringParser,
  KVParser,
  FallbackParser,
]);

describe("createChain", () => {
  it("returns fallback result for empty input", () => {
    const result = autoChain("");
    expect(result.success).toBe(false);
    expect(result.parserName).toBe("none");
  });

  it("routes JSON to JsonDetectParser", () => {
    const result = autoChain('{"hello":"world"}');
    expect(result.success).toBe(true);
    expect(result.parserName).toBe("JsonDetectParser");
    expect(result.confidence).toBe(1.0);
  });

  it("routes log line to LogFrameworkParser", () => {
    const result = autoChain("2024-01-15 10:23:45.123 [main] INFO  com.App - message");
    expect(result.success).toBe(true);
    expect(result.parserName).toBe("LogFrameworkParser");
  });

  it("routes toString to ToStringParser", () => {
    const result = autoChain("Order[id=1, status=ACTIVE]");
    expect(result.success).toBe(true);
    expect(result.parserName).toBe("ToStringParser");
  });

  it("routes KV pairs to KVParser", () => {
    const result = autoChain("user=alice role=admin active=true");
    expect(result.success).toBe(true);
    expect(result.parserName).toBe("KVParser");
  });

  it("falls back to FallbackParser for unrecognized input", () => {
    const result = autoChain("just some random text that matches nothing");
    expect(result.success).toBe(true);
    expect(result.parserName).toBe("FallbackParser");
  });
});

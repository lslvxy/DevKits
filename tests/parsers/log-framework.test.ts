import { describe, expect, it } from "vitest";
import { LogFrameworkParser } from "../../src/tools/log-parser/parsers/log-framework.ts";

describe("LogFrameworkParser", () => {
  const LOG_LINE =
    "2024-01-15 10:23:45.123 [main] INFO  com.example.OrderService - Processing order 12345";

  it("detects logback-style lines with 0.9 confidence", () => {
    expect(LogFrameworkParser.detect(LOG_LINE)).toBe(0.9);
  });

  it("returns 0 for non-log lines", () => {
    expect(LogFrameworkParser.detect("hello world")).toBe(0);
    expect(LogFrameworkParser.detect('{"json":"object"}')).toBe(0);
  });

  it("parses timestamp, thread, level, logger", () => {
    const result = LogFrameworkParser.parse(LOG_LINE);
    expect(result.success).toBe(true);
    expect(result.data?.timestamp).toBe("2024-01-15 10:23:45.123");
    expect(result.data?.thread).toBe("main");
    expect(result.data?.level).toBe("INFO");
    expect(result.data?.logger).toBe("com.example.OrderService");
    expect(result.parserName).toBe("LogFrameworkParser");
    expect(result.confidence).toBe(0.9);
  });

  it("handles comma-separated milliseconds", () => {
    const line = "2024-01-15 10:23:45,123 [http-worker-1] WARN  com.example.App - timeout";
    const result = LogFrameworkParser.parse(line);
    expect(result.success).toBe(true);
    expect(result.data?.timestamp).toBe("2024-01-15 10:23:45,123");
    expect(result.data?.thread).toBe("http-worker-1");
    expect(result.data?.level).toBe("WARN");
  });

  it("extracts traceContext when present", () => {
    const line =
      "2024-01-15 10:23:45.123 [main] INFO  com.example.App - [traceId=abc123, spanId=def456] message body";
    const result = LogFrameworkParser.parse(line);
    expect(result.success).toBe(true);
    expect(result.data?.traceContext).toEqual(["traceId=abc123", "spanId=def456"]);
  });

  it("returns failure for non-matching input", () => {
    const result = LogFrameworkParser.parse("not a log line");
    expect(result.success).toBe(false);
  });

  it("recursively parses toString message", () => {
    const line =
      "2024-01-15 10:23:45.123 [main] INFO  com.example.Svc - Order[id=1, status=ACTIVE]";
    const result = LogFrameworkParser.parse(line);
    expect(result.success).toBe(true);
    const msg = result.data?.message as Record<string, unknown>;
    expect(msg._class).toBe("Order");
    expect(msg.id).toBe(1);
    expect(msg.status).toBe("ACTIVE");
  });
});

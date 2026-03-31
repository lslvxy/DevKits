import { createChain } from "./chain.ts";
import { FallbackParser } from "./fallback.ts";
import { JsonDetectParser } from "./json-detect.ts";
import { KVParser } from "./kv.ts";
import { ToStringParser } from "./to-string.ts";
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

    // Recursively parse the message body
    const messageResult = messageChain(message.trim());

    const data: Record<string, unknown> = {
      timestamp,
      thread,
      level,
      logger,
      ...(traceContext.length > 0 ? { traceContext } : {}),
      message: messageResult.success && messageResult.data ? messageResult.data : { raw: message },
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

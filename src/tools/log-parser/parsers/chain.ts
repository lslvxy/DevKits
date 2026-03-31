import type { LogParser, ParseResult } from "./types.ts";

export function createChain(parsers: LogParser[]) {
  return function dispatch(input: string): ParseResult {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        data: null,
        raw: input,
        parserName: "none",
        confidence: 0,
        error: "空输入",
      };
    }

    // Score all parsers
    const scored = parsers
      .map((p) => ({ parser: p, confidence: p.detect(trimmed) }))
      .filter((s) => s.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence);

    // Try each in order
    for (const { parser } of scored) {
      try {
        const result = parser.parse(trimmed);
        if (result.success) return result;
      } catch {
        // continue to next parser
      }
    }

    // All failed — find a fallback parser
    const fallback = parsers.find((p) => p.name === "FallbackParser");
    if (fallback) {
      return fallback.parse(trimmed);
    }

    return {
      success: false,
      data: null,
      raw: input,
      parserName: "none",
      confidence: 0,
      error: "所有解析器均失败",
    };
  };
}

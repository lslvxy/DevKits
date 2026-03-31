import type { LogParser, ParseResult } from "./types.ts";

export const FallbackParser: LogParser = {
  name: "FallbackParser",
  detect(_input: string): number {
    return 0.1;
  },
  parse(input: string): ParseResult {
    return {
      success: true,
      data: { raw: input },
      raw: input,
      parserName: "FallbackParser",
      confidence: 0.1,
    };
  },
};

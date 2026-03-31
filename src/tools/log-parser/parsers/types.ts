export type ParseResult = {
  success: boolean;
  data: Record<string, unknown> | null;
  raw: string;
  parserName: string;
  confidence: number;
  error?: string;
};

export interface LogParser {
  name: string;
  detect(input: string): number;
  parse(input: string): ParseResult;
}

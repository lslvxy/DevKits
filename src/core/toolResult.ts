export type ToolResult<T> = { success: true; data: T } | { success: false; error: string };

export function toolResult<T>(process: () => T): ToolResult<T> {
  try {
    return { success: true, data: process() };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

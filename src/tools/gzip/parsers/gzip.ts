import type { ToolResult } from "../../../core/toolResult.ts";

const LIMIT = 16 * 1024 * 1024;

function fromBase64(input: string): Uint8Array {
  const value = input.replace(/\s/g, "");
  if (value.length > Math.ceil(LIMIT / 3) * 4)
    throw new Error("压缩输入超过 16 MiB / Compressed input exceeds 16 MiB");
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

export async function processGzip(
  input: string,
  mode: "compress" | "decompress",
  signal?: AbortSignal
): Promise<ToolResult<string>> {
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    if (!input) return { success: true, data: "" };
    if (typeof CompressionStream === "undefined" || typeof DecompressionStream === "undefined") {
      throw new Error(
        "当前 WebView 不支持压缩流，请更新系统 / Update the system WebView to support compression streams"
      );
    }
    if (input.length > Math.ceil(LIMIT / 3) * 4) throw new Error("输入过大 / Input is too large");
    const bytes = mode === "compress" ? new TextEncoder().encode(input) : fromBase64(input);
    if (bytes.byteLength > LIMIT) throw new Error("输入超过 16 MiB / Input exceeds 16 MiB");
    const transform =
      mode === "compress" ? new CompressionStream("gzip") : new DecompressionStream("gzip");
    const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(transform);
    reader = stream.getReader();
    const abort = () => {
      void reader?.cancel().catch(() => {});
    };
    signal?.addEventListener("abort", abort, { once: true });
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        if (signal?.aborted) throw new Error("已取消 / Cancelled");
        const { value, done } = await reader.read();
        if (signal?.aborted) throw new Error("已取消 / Cancelled");
        if (done) break;
        size += value.byteLength;
        if (size > LIMIT)
          throw new Error("输出超过 16 MiB，已停止 / Output exceeds 16 MiB; stopped");
        chunks.push(value);
      }
    } finally {
      signal?.removeEventListener("abort", abort);
    }
    const output = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      output.set(chunk, offset);
      offset += chunk.length;
    }
    return {
      success: true,
      data:
        mode === "compress"
          ? toBase64(output)
          : new TextDecoder("utf-8", { fatal: true }).decode(output),
    };
  } catch (error) {
    await reader?.cancel().catch(() => {});
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    reader?.releaseLock();
  }
}

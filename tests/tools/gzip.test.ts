import { Blob } from "node:buffer";
import { CompressionStream, DecompressionStream } from "node:stream/web";
import { TextDecoder, TextEncoder } from "node:util";
import { gunzipSync, gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { processGzip } from "../../src/tools/gzip/parsers/gzip.ts";

beforeAll(() => {
  vi.stubGlobal("Blob", Blob);
  vi.stubGlobal("CompressionStream", CompressionStream);
  vi.stubGlobal("DecompressionStream", DecompressionStream);
  vi.stubGlobal("TextEncoder", TextEncoder);
  vi.stubGlobal("TextDecoder", TextDecoder);
});
afterAll(() => vi.unstubAllGlobals());

describe("Gzip text codec", () => {
  it("interoperates with standard zlib and preserves UTF-8", async () => {
    const text = "Hello 你好 😀\n";
    const compressed = await processGzip(text, "compress");
    if (!compressed.success) throw new Error(compressed.error);
    expect(gunzipSync(Buffer.from(compressed.data, "base64")).toString("utf8")).toBe(text);
    expect(await processGzip(gzipSync(text).toString("base64"), "decompress")).toEqual({
      success: true,
      data: text,
    });
  });
  it("reports invalid gzip and Base64", async () => {
    expect((await processGzip("!!!!", "decompress")).success).toBe(false);
    expect((await processGzip(btoa("not gzip"), "decompress")).success).toBe(false);
  });
  it("stops decompression above the output limit", async () => {
    const compressed = gzipSync(Buffer.alloc(16 * 1024 * 1024 + 1)).toString("base64");
    const result = await processGzip(compressed, "decompress");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("16 MiB");
  });
  it("honors cancellation", async () => {
    const controller = new AbortController();
    controller.abort();
    expect((await processGzip("hello", "compress", controller.signal)).success).toBe(false);
  });
});

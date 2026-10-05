import { describe, expect, it } from "vitest";
import { analyzeStack } from "../../src/tools/java-stack/parsers/javaStack.ts";

const source = `Exception in thread "main" java.lang.RuntimeException: outer
    at java.base/java.lang.Thread.run(Thread.java:840)
    Suppressed: java.io.IOException: closing
        at com.example.Closer.close(Closer.java:12)
Caused by: java.lang.IllegalStateException: actual cause
    at app/com.example.Service.run(Service.java:42)
    ... 2 more`;

describe("Java stack", () => {
  it("finds main root cause independently of suppressed exceptions", () => {
    const result = analyzeStack(source, "com.example.", true);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const data = JSON.parse(result.data);
    expect(data.rootCause).toEqual({
      type: "java.lang.IllegalStateException",
      message: "actual cause",
    });
    expect(data.exceptions[0].frames).toEqual([]);
    expect(data.exceptions[1].suppressed).toBe(true);
    expect(data.exceptions[2].omitted).toBe(2);
    expect(data.businessFrames).toHaveLength(2);
  });
  it("does not treat nested suppressed causes as the main cause", () => {
    const result = analyzeStack(
      "java.lang.RuntimeException: main\n\tSuppressed: java.io.IOException: suppressed\n\tCaused by: java.lang.IllegalStateException: nested"
    );
    if (!result.success) throw new Error(result.error);
    expect(JSON.parse(result.data).rootCause.type).toBe("java.lang.RuntimeException");
  });
  it("reports unrecognized input", () => {
    expect(analyzeStack("ordinary log message").success).toBe(false);
  });
});

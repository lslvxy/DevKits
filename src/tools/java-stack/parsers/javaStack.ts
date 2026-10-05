import { toolResult } from "../../../core/toolResult.ts";

type ExceptionEntry = {
  type: string;
  message: string;
  frames: string[];
  suppressed: boolean;
  omitted: number;
};
const HEADER =
  /(?:^|\s)(?:(Caused by|Suppressed):\s*)?((?:[\w$]+\.)*[\w$]*(?:Exception|Error|Throwable))(?::\s*(.*))?$/;

export function analyzeStack(input: string, businessPrefix = "", hideFramework = false) {
  return toolResult(() => {
    const entries: ExceptionEntry[] = [];
    let current: ExceptionEntry | undefined;
    let suppressedIndent: number | null = null;
    const framework =
      /^(?:java\.|javax\.|jdk\.|sun\.|com\.sun\.|org\.springframework\.|org\.apache\.|org\.hibernate\.|reactor\.|io\.netty\.)/;
    for (const raw of input.split(/\r\n|\n|\r/)) {
      const line = raw.trim();
      const header = HEADER.exec(line);
      if (header) {
        const indent = raw.match(/^\s*/)?.[0].length ?? 0;
        if (header[1] === "Suppressed") suppressedIndent = indent;
        else if (suppressedIndent !== null && indent < suppressedIndent) suppressedIndent = null;
        current = {
          type: header[2],
          message: header[3] ?? "",
          frames: [],
          suppressed: header[1] === "Suppressed" || suppressedIndent !== null,
          omitted: 0,
        };
        entries.push(current);
      } else if (current && /^at\s+/.test(line)) {
        current.frames.push(line.replace(/^at\s+/, ""));
      } else if (current) {
        const omitted = /^\.\.\. (\d+) (?:more|common frames omitted)$/.exec(line);
        if (omitted) current.omitted = Number(omitted[1]);
      }
    }
    if (!entries.length) throw new Error("未识别到 Java 异常堆栈 / No Java exception stack found");
    const causes = entries.filter((entry) => !entry.suppressed);
    const root = causes[causes.length - 1];
    const prefixes = businessPrefix
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const className = (frame: string) => frame.slice(frame.lastIndexOf("/") + 1);
    const businessFrames = entries
      .flatMap((entry) => entry.frames)
      .filter((frame) => prefixes.some((prefix) => className(frame).startsWith(prefix)));
    return JSON.stringify(
      {
        rootCause: root ? { type: root.type, message: root.message } : null,
        exceptionCount: entries.length,
        businessFrames,
        exceptions: entries.map((entry) => ({
          ...entry,
          frames: hideFramework
            ? entry.frames.filter((frame) => !framework.test(className(frame)))
            : entry.frames,
        })),
      },
      null,
      2
    );
  });
}

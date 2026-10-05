import { createTwoFilesPatch } from "diff";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";
import { getT } from "../../i18n/index.ts";

type DiffLine = {
  id: string;
  text: string;
  kind: "added" | "removed" | "hunk" | "context";
};

function parsePatch(patch: string): DiffLine[] {
  const lines = patch.split("\n").slice(4); // skip Index/===/---/+++
  return lines.map((text, i) => {
    const kind: DiffLine["kind"] = text.startsWith("@@")
      ? "hunk"
      : text.startsWith("+")
        ? "added"
        : text.startsWith("-")
          ? "removed"
          : "context";
    return { id: String(i), text, kind };
  });
}

function hasChanges(lines: DiffLine[]) {
  return lines.some((l) => l.kind === "added" || l.kind === "removed");
}

export function TextDiffTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [left, setLeft] = useToolDraft("text-diff:left");
  const [right, setRight] = useToolDraft("text-diff:right");
  const [leftFileName, setLeftFileName] = useState("");
  const [rightFileName, setRightFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [lines, setLines] = useState<DiffLine[]>([]);
  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightFileRef = useRef<HTMLInputElement>(null);

  const compute = useCallback(() => {
    if (!left && !right) {
      setLines([]);
      return;
    }
    const patch = createTwoFilesPatch(
      t.tools.textDiff.leftPanel,
      t.tools.textDiff.rightPanel,
      left,
      right
    );
    setLines(parsePatch(patch));
  }, [left, right, t]);

  useEffect(() => {
    const timer = setTimeout(compute, 300);
    return () => clearTimeout(timer);
  }, [compute]);
  const handleFile = (side: "left" | "right") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      // Reject binary files: a NUL byte in the sample is a strong indicator.
      const sample = bytes.subarray(0, Math.min(bytes.length, 8192));
      if (sample.includes(0)) {
        setFileError(`${t.tools.textDiff.binaryFileError} (${file.name})`);
        return;
      }
      const text = new TextDecoder().decode(bytes);
      if (side === "left") {
        setLeft(text);
        setLeftFileName(file.name);
      } else {
        setRight(text);
        setRightFileName(file.name);
      }
      setFileError("");
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const kindCls: Record<DiffLine["kind"], string> = {
    added: "bg-green-900/40 text-green-300",
    removed: "bg-red-900/40 text-red-300",
    hunk: "text-blue-400",
    context: "text-[#d4d4d4]",
  };

  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#d4d4d4]">
              {t.tools.textDiff.leftPanel}
              {leftFileName && (
                <span className="ml-2 text-xs text-[#858585]">— {leftFileName}</span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => leftFileRef.current?.click()}
              className="px-2 py-1 text-xs rounded bg-[#3c3c3c] hover:bg-[#4c4c4c] text-[#d4d4d4] transition-colors"
            >
              {t.tools.textDiff.selectFile}
            </button>
          </div>
          <input
            ref={leftFileRef}
            type="file"
            accept=".txt,.md,.markdown,.json,.csv,.tsv,.xml,.yml,.yaml,.log,.sql,.ini,.conf,.toml,.env,.sh,.js,.ts,.jsx,.tsx,.html,.css,.py,.java,.rs,.go,.c,.cpp,.h,.hpp,text/plain"
            className="hidden"
            onChange={handleFile("left")}
          />
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder={t.tools.textDiff.leftPlaceholder}
            className="h-48 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
          />
        </div>
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#d4d4d4]">
              {t.tools.textDiff.rightPanel}
              {rightFileName && (
                <span className="ml-2 text-xs text-[#858585]">— {rightFileName}</span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => rightFileRef.current?.click()}
              className="px-2 py-1 text-xs rounded bg-[#3c3c3c] hover:bg-[#4c4c4c] text-[#d4d4d4] transition-colors"
            >
              {t.tools.textDiff.selectFile}
            </button>
          </div>
          <input
            ref={rightFileRef}
            type="file"
            accept=".txt,.md,.markdown,.json,.csv,.tsv,.xml,.yml,.yaml,.log,.sql,.ini,.conf,.toml,.env,.sh,.js,.ts,.jsx,.tsx,.html,.css,.py,.java,.rs,.go,.c,.cpp,.h,.hpp,text/plain"
            className="hidden"
            onChange={handleFile("right")}
          />
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder={t.tools.textDiff.rightPlaceholder}
            className="h-48 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

      {fileError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {fileError}
        </div>
      )}

      {(left || right) && (
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">{t.tools.textDiff.diffResult}</h3>
          <div className="max-h-96 overflow-auto rounded border border-[#3e3e42] bg-[#1e1e1e]">
            {!hasChanges(lines) ? (
              <p className="p-3 text-sm text-[#858585]">{t.tools.textDiff.noDiff}</p>
            ) : (
              lines.map((line) => (
                <div
                  key={line.id}
                  className={`px-2 py-0.5 font-mono text-xs ${kindCls[line.kind]}`}
                >
                  {line.text || " "}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

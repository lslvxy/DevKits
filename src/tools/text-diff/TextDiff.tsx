import { createTwoFilesPatch } from "diff";
import { useCallback, useEffect, useState } from "react";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";

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
  const [lines, setLines] = useState<DiffLine[]>([]);

  const compute = useCallback(() => {
    if (!left && !right) {
      setLines([]);
      return;
    }
    const patch = createTwoFilesPatch(t.tools.textDiff.leftPanel, t.tools.textDiff.rightPanel, left, right);
    setLines(parsePatch(patch));
  }, [left, right]);

  useEffect(() => {
    const t = setTimeout(compute, 300);
    return () => clearTimeout(t);
  }, [compute]);

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
          <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">{t.tools.textDiff.leftPanel}</h3>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder={t.tools.textDiff.leftPlaceholder}
            className="h-48 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
          />
        </div>
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">{t.tools.textDiff.rightPanel}</h3>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder={t.tools.textDiff.rightPlaceholder}
            className="h-48 w-full resize-none rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

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

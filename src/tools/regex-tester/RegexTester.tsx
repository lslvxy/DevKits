import { useMemo, useState } from "react";
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

type RegexFlag = "g" | "i" | "m" | "s";

interface MatchResult {
  index: number;
  match: string;
  groups: Record<string, string | undefined>;
  groupList: (string | undefined)[];
}

function runRegex(
  pattern: string,
  flags: Set<RegexFlag>,
  testStr: string
): { matches: MatchResult[]; error: string | null } {
  if (!pattern) return { matches: [], error: null };
  try {
    const flagStr = [...flags].join("");
    const re = new RegExp(pattern, flagStr.includes("g") ? flagStr : `g${flagStr}`);
    const matches: MatchResult[] = [];
    for (const match of testStr.matchAll(re)) {
      matches.push({
        index: match.index ?? 0,
        match: match[0],
        groups: match.groups ?? {},
        groupList: [...match].slice(1),
      });
    }
    return { matches, error: null };
  } catch (e) {
    return { matches: [], error: e instanceof Error ? e.message : "Invalid regex" };
  }
}

// Produce HTML with highlighted matches
function buildHighlighted(text: string, matches: MatchResult[]): string {
  if (matches.length === 0) return escapeHtml(text);
  const sorted = [...matches].sort((a, b) => a.index - b.index);
  let result = "";
  let pos = 0;
  for (const m of sorted) {
    if (m.index < pos) continue;
    result += escapeHtml(text.slice(pos, m.index));
    result += `<mark class="bg-[#264f78] text-[#9cdcfe] rounded">${escapeHtml(m.match)}</mark>`;
    pos = m.index + m.match.length;
  }
  result += escapeHtml(text.slice(pos));
  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>")
    .replace(/ /g, "&nbsp;");
}

export function RegexTesterTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Set<RegexFlag>>(new Set(["g"]));
  const [testStr, setTestStr] = useState("");

  const FLAG_OPTIONS: { flag: RegexFlag; label: string; desc: string }[] = [
    { flag: "g", label: "g", desc: t.tools.regexTester.globalFlag },
    { flag: "i", label: "i", desc: t.tools.regexTester.ignoreCaseFlag },
    { flag: "m", label: "m", desc: t.tools.regexTester.multilineFlag },
    { flag: "s", label: "s", desc: ". matches newline" },
  ];

  const toggleFlag = (f: RegexFlag) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const { matches, error } = useMemo(
    () => runRegex(pattern, flags, testStr),
    [pattern, flags, testStr]
  );

  const highlighted = useMemo(
    () => (error ? "" : buildHighlighted(testStr, matches)),
    [testStr, matches, error]
  );

  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-auto">
      {/* Pattern input */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.regexTester.pattern}</h3>
        <div className="flex items-center gap-0">
          <span className="px-3 py-2 bg-[#3c3c3c] text-[#858585] text-sm rounded-l border border-[#3e3e42] border-r-0 select-none">
            /
          </span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder={t.tools.regexTester.testPlaceholder}
            className={`flex-1 bg-[#1e1e1e] border-y border-[#3e3e42] px-3 py-2 text-sm text-[#d4d4d4] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4] ${
              error ? "border-red-500" : ""
            }`}
          />
          <span className="px-3 py-2 bg-[#3c3c3c] text-[#858585] text-sm border border-[#3e3e42] border-l-0 border-r-0 select-none">
            /
          </span>
          <span className="px-3 py-2 bg-[#3c3c3c] text-[#9cdcfe] text-sm font-mono rounded-r border border-[#3e3e42] border-l-0 select-none">
            {[...flags].join("")}
          </span>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        {/* Flags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {FLAG_OPTIONS.map(({ flag, label, desc }) => (
            <button
              key={flag}
              type="button"
              onClick={() => toggleFlag(flag)}
              title={desc}
              className={`px-2.5 py-1 text-xs rounded font-mono transition-colors ${
                flags.has(flag)
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#3c3c3c] text-[#858585] hover:bg-[#4c4c4c]"
              }`}
            >
              {label}
              <span className="ml-1 font-sans opacity-70">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Test string */}
      <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[#d4d4d4]">{t.tools.regexTester.testInput}</h3>
          <span className="text-xs text-[#858585]">
            {matches.length > 0 ? (
              <span className="text-[#4ec9b0]">✓ {matches.length} {t.tools.regexTester.matched}</span>
            ) : pattern && !error ? (
              <span className="text-yellow-400">{t.tools.regexTester.noMatch}</span>
            ) : null}
          </span>
        </div>
        <textarea
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          placeholder={t.tools.regexTester.testPlaceholder}
          className="w-full h-36 bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-[#d4d4d4] font-mono placeholder-[#858585] outline-none focus:border-[#0078d4] resize-none"
        />
      </div>

      {/* Highlighted result */}
      {testStr && !error && (
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <h3 className="text-sm font-medium text-[#d4d4d4] mb-2">{t.tools.regexTester.highlightTitle}</h3>
          <div
            className="bg-[#1e1e1e] rounded px-3 py-2 text-sm font-mono leading-relaxed text-[#d4d4d4] min-h-[48px]"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled by internal escapeHtml
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      )}

      {/* Match details */}
      {matches.length > 0 && (
        <div className="bg-[#252526] rounded-lg p-4 border border-[#3e3e42]">
          <h3 className="text-sm font-medium text-[#d4d4d4] mb-3">{t.tools.regexTester.detailsTitle}</h3>
          <div className="flex flex-col gap-2">
            {matches.map((m, i) => (
              <div
                key={`${m.index}-${m.match}`}
                className="bg-[#1e1e1e] rounded px-3 py-2 text-xs font-mono"
              >
                <div className="flex items-start gap-4">
                  <span className="text-[#858585] shrink-0">#{i + 1}</span>
                  <div className="flex-1">
                    <span className="text-[#9cdcfe]">"{m.match}"</span>
                    <span className="text-[#858585] ml-3">{t.tools.regexTester.position}: {m.index}</span>
                    <span className="text-[#858585] ml-3">{t.tools.regexTester.length}: {m.match.length}</span>
                  </div>
                </div>
                {m.groupList.length > 0 && (
                  <div className="mt-1.5 pl-8 text-[#858585]">
                    {t.tools.regexTester.groups}:{" "}
                    {m.groupList.map((g, j) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: group indices are positionally meaningful
                      <span key={j} className="mr-2">
                        [{j + 1}]<span className="text-[#ce9178]"> {g ?? "undefined"}</span>
                      </span>
                    ))}
                  </div>
                )}
                {Object.keys(m.groups).length > 0 && (
                  <div className="mt-1 pl-8 text-[#858585]">
                    命名分组:{" "}
                    {Object.entries(m.groups).map(([k, v]) => (
                      <span key={k} className="mr-2">
                        {k}=<span className="text-[#ce9178]">{v ?? "undefined"}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

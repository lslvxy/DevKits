import { useMemo, useState } from "react";
import { CopyButton } from "../../components/CopyButton.tsx";
import { getToolT } from "../../core/registry.ts";
import { useStore } from "../../core/store.ts";
import { useToolDraft } from "../../core/useToolDraft.ts";

type Command = {
  id: string;
  category: string;
  command: string;
  description: { zh: string; en: string };
  syntax: { zh: string; en: string };
  examples: string[];
  notes?: { zh: string; en: string };
};

const COMMANDS: Command[] = [
  {
    id: "pwd",
    category: "files",
    command: "pwd",
    description: { zh: "显示当前工作目录", en: "Print the current working directory" },
    syntax: { zh: "pwd", en: "pwd" },
    examples: ["pwd"],
  },
  {
    id: "ls",
    category: "files",
    command: "ls -lah",
    description: {
      zh: "以易读格式列出目录内容（包括隐藏文件）",
      en: "List directory contents, including hidden files, in human-readable form",
    },
    syntax: { zh: "ls [选项] [目录]", en: "ls [options] [directory]" },
    examples: ["ls -lah", "ls -lt /var/log"],
  },
  {
    id: "find",
    category: "files",
    command: "find . -type f -name '*.log'",
    description: { zh: "按条件查找文件或目录", en: "Find files or directories by criteria" },
    syntax: { zh: "find <路径> [条件] [动作]", en: "find <path> [criteria] [action]" },
    examples: ["find . -type f -name '*.log'", "find /var/log -mtime -1"],
  },
  {
    id: "grep",
    category: "text",
    command: "grep -Rni 'pattern' .",
    description: { zh: "在文件内容中递归搜索文本", en: "Recursively search file contents" },
    syntax: { zh: "grep [选项] <模式> <文件...>", en: "grep [options] <pattern> <files...>" },
    examples: ["grep -Rni 'error' ./logs", "grep -E 'warn|error' app.log"],
  },
  {
    id: "tail",
    category: "text",
    command: "tail -f app.log",
    description: {
      zh: "查看文件末尾内容，持续跟踪新增日志",
      en: "View the end of a file or follow new log output",
    },
    syntax: { zh: "tail [选项] <文件>", en: "tail [options] <file>" },
    examples: ["tail -n 100 app.log", "tail -f /var/log/nginx/access.log"],
  },
  {
    id: "sed",
    category: "text",
    command: "sed -n '1,20p' file.txt",
    description: {
      zh: "流式查找、替换或选取文本",
      en: "Select, search, or replace text in a stream",
    },
    syntax: { zh: "sed [选项] '脚本' <文件>", en: "sed [options] 'script' <file>" },
    examples: ["sed -n '1,20p' file.txt", "sed -i 's/old/new/g' config.ini"],
  },
  {
    id: "awk",
    category: "text",
    command: "awk '{print $1}' access.log",
    description: { zh: "按列处理结构化文本", en: "Process structured text by fields" },
    syntax: { zh: "awk '模式 {动作}' <文件>", en: "awk 'pattern { action }' <file>" },
    examples: ["awk '{print $1, $7}' access.log", "awk -F, '{sum += $3} END {print sum}' data.csv"],
  },
  {
    id: "du",
    category: "system",
    command: "du -sh *",
    description: {
      zh: "统计文件或目录占用的磁盘空间",
      en: "Estimate file and directory disk usage",
    },
    syntax: { zh: "du [选项] [路径]", en: "du [options] [path]" },
    examples: ["du -sh *", "du -h --max-depth=1 /var | sort -h"],
  },
  {
    id: "df",
    category: "system",
    command: "df -h",
    description: { zh: "查看文件系统磁盘空间使用情况", en: "Show file-system disk space usage" },
    syntax: { zh: "df [选项] [文件系统]", en: "df [options] [filesystem]" },
    examples: ["df -h", "df -h /home"],
  },
  {
    id: "ps",
    category: "system",
    command: "ps aux --sort=-%cpu | head",
    description: { zh: "查看当前运行的进程", en: "Show currently running processes" },
    syntax: { zh: "ps [选项]", en: "ps [options]" },
    examples: ["ps aux", "ps -ef | grep nginx"],
  },
  {
    id: "kill",
    category: "system",
    command: "kill -TERM <pid>",
    description: { zh: "向进程发送信号", en: "Send a signal to a process" },
    syntax: { zh: "kill [信号] <PID>", en: "kill [signal] <PID>" },
    examples: ["kill -TERM 1234", "kill -9 1234"],
    notes: {
      zh: "优先使用 TERM 让程序正常退出，只有在必要时才使用 KILL（-9）。",
      en: "Prefer TERM for a graceful shutdown. Use KILL (-9) only when necessary.",
    },
  },
  {
    id: "ip",
    category: "network",
    command: "ip addr show",
    description: {
      zh: "查看网络接口和 IP 地址",
      en: "Inspect network interfaces and IP addresses",
    },
    syntax: { zh: "ip <对象> <命令>", en: "ip <object> <command>" },
    examples: ["ip addr show", "ip route show", "ip link set eth0 up"],
  },
  {
    id: "curl",
    category: "network",
    command: "curl -I https://example.com",
    description: { zh: "发起 HTTP 请求或下载内容", en: "Make HTTP requests or download content" },
    syntax: { zh: "curl [选项] <URL>", en: "curl [options] <URL>" },
    examples: [
      "curl -I https://example.com",
      "curl -sS -X POST -H 'Content-Type: application/json' -d '{}' https://api.example.com",
    ],
  },
  {
    id: "ssh",
    category: "network",
    command: "ssh user@host",
    description: { zh: "通过 SSH 连接远程主机", en: "Connect to a remote host over SSH" },
    syntax: { zh: "ssh [选项] [用户@]主机", en: "ssh [options] [user@]host" },
    examples: ["ssh user@192.168.1.10", "ssh -p 2222 user@host"],
  },
  {
    id: "chmod",
    category: "permissions",
    command: "chmod +x script.sh",
    description: { zh: "修改文件或目录权限", en: "Change file or directory permissions" },
    syntax: { zh: "chmod [选项] <模式> <文件...>", en: "chmod [options] <mode> <files...>" },
    examples: ["chmod +x script.sh", "chmod 644 config.ini", "chmod -R u=rwX,go=rX public/"],
  },
  {
    id: "tar",
    category: "files",
    command: "tar -czf archive.tar.gz folder/",
    description: { zh: "创建或解压 tar 压缩包", en: "Create or extract tar archives" },
    syntax: { zh: "tar [选项] [归档文件] [文件...]", en: "tar [options] [archive] [files...]" },
    examples: ["tar -czf archive.tar.gz folder/", "tar -xzf archive.tar.gz -C /tmp"],
  },
];

const CATEGORY_KEYS = ["all", "files", "text", "system", "network", "permissions"] as const;

export function LinuxCommandsTool() {
  const locale = useStore((s) => s.locale);
  const [query, setQuery] = useToolDraft("linux-command:query");
  const [mode, setMode] = useState<"local" | "online">("local");
  const [category, setCategory] = useState<(typeof CATEGORY_KEYS)[number]>("all");
  const [selectedId, setSelectedId] = useState(COMMANDS[0].id);
  const i18n = getToolT("linux-command", locale);
  const label = (key: string, fallback: string) => i18n[key] ?? fallback;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return COMMANDS.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!normalized) return true;
      return [
        item.command,
        item.description.zh,
        item.description.en,
        item.syntax.zh,
        item.syntax.en,
        ...item.examples,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [category, query]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-6">
      <div className="flex flex-col gap-3 rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-[#d4d4d4]">
              {label("title", "Linux 命令速查")}
            </h3>
            <p className="mt-1 text-xs text-[#858585]">{label("hint", "搜索命令、用途或示例")}</p>
          </div>
          {mode === "local" && (
            <span className="font-mono text-xs text-[#666]">
              {filtered.length}/{COMMANDS.length}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("local")}
            className={`rounded px-3 py-1.5 text-xs transition-colors ${
              mode === "local"
                ? "bg-[#007acc] text-white"
                : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
            }`}
          >
            {label("localTab", "本地速查")}
          </button>
          <button
            type="button"
            onClick={() => setMode("online")}
            className={`rounded px-3 py-1.5 text-xs transition-colors ${
              mode === "online"
                ? "bg-[#007acc] text-white"
                : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
            }`}
          >
            {label("onlineTab", "在线查询")}
          </button>
        </div>
        {mode === "online" ? (
          <OnlineLookup label={label} />
        ) : (
          <>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={label("search", "搜索命令，例如 find、日志、网络...")}
              className="w-full rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`rounded px-3 py-1.5 text-xs transition-colors ${
                    category === key
                      ? "bg-[#007acc] text-white"
                      : "bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4c4c4c]"
                  }`}
                >
                  {label(`category.${key}`, key === "all" ? "全部" : key)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {mode === "local" && (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.7fr)]">
          <div className="min-h-0 overflow-auto rounded-lg border border-[#3e3e42] bg-[#252526] p-2">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-xs text-[#858585]">
                {label("empty", "没有匹配的命令")}
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`rounded px-3 py-2 text-left transition-colors ${
                      selected?.id === item.id ? "bg-[#0e3a5c]" : "hover:bg-[#2a2a2a]"
                    }`}
                  >
                    <span className="block font-mono text-sm text-[#9cdcfe]">{item.command}</span>
                    <span className="mt-1 block text-xs text-[#858585]">
                      {item.description[locale]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-0 overflow-auto rounded-lg border border-[#3e3e42] bg-[#252526] p-4">
            {selected ? (
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-mono text-lg text-[#9cdcfe]">{selected.command}</h3>
                    <p className="mt-2 text-sm text-[#d4d4d4]">{selected.description[locale]}</p>
                  </div>
                  <CopyButton text={selected.command} />
                </div>
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#858585]">
                    {label("syntaxTitle", "语法")}
                  </h4>
                  <code className="block rounded bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4]">
                    {selected.syntax[locale]}
                  </code>
                </section>
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#858585]">
                    {label("examplesTitle", "示例")}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selected.examples.map((example) => (
                      <div
                        key={example}
                        className="flex items-center justify-between gap-2 rounded bg-[#1e1e1e] px-3 py-2"
                      >
                        <code className="min-w-0 break-all font-mono text-sm text-[#d4d4d4]">
                          {example}
                        </code>
                        <CopyButton text={example} />
                      </div>
                    ))}
                  </div>
                </section>
                {selected.notes && (
                  <p className="border-l-2 border-yellow-600 pl-3 text-xs text-yellow-200">
                    {selected.notes[locale]}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#858585]">{label("empty", "没有匹配的命令")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OnlineLookup({
  label,
}: {
  label: (key: string, fallback: string) => string;
}) {
  const [command, setCommand] = useToolDraft("linux-command:online-command");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    const name = command.trim().split(/\s+/)[0] ?? "";
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._+-]*$/.test(name)) {
      setError(label("onlineInvalid", "请输入单个命令名，例如 grep 或 systemctl"));
      setResult("");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/tldr-pages/tldr/main/pages/common/${encodeURIComponent(name)}.md`
      );
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? label("onlineNotFound", "未找到该命令的在线文档")
            : `${response.status}`
        );
      }
      setResult(await response.text());
    } catch (cause) {
      setError(
        cause instanceof TypeError
          ? label("onlineNetworkError", "网络请求失败，请检查网络连接")
          : cause instanceof Error
            ? cause.message
            : label("onlineFailed", "在线查询失败")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[#858585]">
        {label("onlineHint", "数据来源：tldr-pages（GitHub）。只查询命令名，不会执行命令。")}
      </p>
      <div className="flex gap-2">
        <input
          type="search"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void lookup();
          }}
          placeholder={label("onlinePlaceholder", "输入命令名，例如 systemctl")}
          className="min-w-0 flex-1 rounded border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-[#d4d4d4] outline-none focus:border-[#007acc]"
        />
        <button
          type="button"
          onClick={() => void lookup()}
          disabled={loading}
          className="rounded bg-[#007acc] px-4 py-2 text-sm text-white transition-colors hover:bg-[#005a9e] disabled:opacity-50"
        >
          {loading ? label("onlineLoading", "查询中...") : label("onlineSearch", "查询")}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <div className="rounded border border-[#3e3e42] bg-[#1e1e1e] p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs text-[#858585]">{label("onlineResult", "在线文档")}</span>
            <CopyButton text={result} />
          </div>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap font-mono text-sm leading-6 text-[#d4d4d4]">
            {result}
          </pre>
          <a
            href={`https://github.com/tldr-pages/tldr/blob/main/pages/common/${encodeURIComponent(command.trim().split(/\s+/)[0] ?? "")}.md`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs text-[#569cd6] hover:underline"
          >
            {label("onlineSource", "在 GitHub 查看来源")}
          </a>
        </div>
      )}
    </div>
  );
}

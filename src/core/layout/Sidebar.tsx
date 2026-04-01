import { useEffect, useRef, useState } from "react";
import { type Locale, getT } from "../../i18n/index.ts";
import { getAllTools } from "../registry.ts";
import { useStore } from "../store.ts";
import { CATEGORY_ORDER, type ToolCategory, type ToolDefinition } from "../types.ts";

export function Sidebar() {
  const {
    activeToolId,
    searchQuery,
    locale,
    favoriteToolIds,
    setActiveTool,
    setSearchQuery,
    setLocale,
    toggleFavoriteTool,
  } = useStore();
  const searchRef = useRef<HTMLInputElement>(null);
  const [, forceRender] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const t = getT(locale);

  // Force render to pick up registered tools
  useEffect(() => {
    forceRender((n) => n + 1);
  }, []);

  const allTools = getAllTools();
  const favoriteSet = new Set(favoriteToolIds);
  const favoriteTools = allTools.filter((tool) => favoriteSet.has(tool.id));

  const sortByFavoriteFirst = (tools: ToolDefinition[]) =>
    [...tools].sort((a, b) => Number(favoriteSet.has(b.id)) - Number(favoriteSet.has(a.id)));

  const filtered = sortByFavoriteFirst(
    searchQuery
      ? allTools.filter((tool) => {
          const q = searchQuery.toLowerCase();
          return (
            tool.name.zh.toLowerCase().includes(q) ||
            tool.name.en.toLowerCase().includes(q) ||
            tool.description.zh.toLowerCase().includes(q) ||
            tool.description.en.toLowerCase().includes(q) ||
            tool.keywords.some((k) => k.toLowerCase().includes(q))
          );
        })
      : allTools
  );

  // Group by category
  const grouped = CATEGORY_ORDER.reduce<Record<ToolCategory, ToolDefinition[]>>(
    (acc, cat) => {
      acc[cat] = filtered.filter((tool) => tool.category === cat);
      return acc;
    },
    {} as Record<ToolCategory, ToolDefinition[]>
  );

  // Cmd+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (collapsed) {
    return (
      <aside className="flex h-screen w-[48px] min-w-[48px] flex-col bg-[#202020] border-r border-[#333333] items-center py-3 gap-2">
        <span className="text-xl">🛠️</span>
        <div className="flex-1" />
        <button
          type="button"
          title={t.ui.expandSidebar}
          onClick={() => setCollapsed(false)}
          className="text-[#888] hover:text-[#e0e0e0] transition-colors p-1 rounded"
        >
          ▶
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex h-screen w-[230px] min-w-[230px] flex-col bg-[#202020] border-r border-[#333333]">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <h1 className="text-[15px] font-semibold text-white tracking-wide">DevKits</h1>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[#333333]">
        <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-md px-2.5 py-1.5 border border-[#3a3a3a] focus-within:border-[#0078d4] transition-colors">
          <span className="text-[#666] text-sm">🔍</span>
          <input
            ref={searchRef}
            type="text"
            placeholder={t.ui.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#e0e0e0] placeholder-[#666] outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[#666] hover:text-[#e0e0e0] text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tool list */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {searchQuery ? (
          // Flat list when searching
          <div className="px-2">
            {filtered.length === 0 && (
              <p className="px-2 py-4 text-xs text-[#666] text-center">{t.ui.noToolsFound}</p>
            )}
            {filtered.map((tool) => (
              <ToolItem
                key={tool.id}
                tool={tool}
                locale={locale}
                active={tool.id === activeToolId}
                isFavorite={favoriteSet.has(tool.id)}
                favoriteTitle={favoriteSet.has(tool.id) ? t.ui.removeFavorite : t.ui.addFavorite}
                onToggleFavorite={() => toggleFavoriteTool(tool.id)}
                onClick={() => setActiveTool(tool.id)}
              />
            ))}
          </div>
        ) : (
          <>
            {favoriteTools.length > 0 && (
              <div className="mb-1">
                <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-[#555] uppercase tracking-wider">
                  {t.ui.favorites}
                </p>
                <div className="px-2">
                  {favoriteTools.map((tool) => (
                    <ToolItem
                      key={tool.id}
                      tool={tool}
                      locale={locale}
                      active={tool.id === activeToolId}
                      isFavorite={true}
                      favoriteTitle={t.ui.removeFavorite}
                      onToggleFavorite={() => toggleFavoriteTool(tool.id)}
                      onClick={() => setActiveTool(tool.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {CATEGORY_ORDER.map((cat) => {
              const tools = grouped[cat].filter((tool) => !favoriteSet.has(tool.id));
              if (tools.length === 0) return null;
              return (
                <div key={cat} className="mb-1">
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-[#555] uppercase tracking-wider">
                    {t.categories[cat]}
                  </p>
                  <div className="px-2">
                    {tools.map((tool) => (
                      <ToolItem
                        key={tool.id}
                        tool={tool}
                        locale={locale}
                        active={tool.id === activeToolId}
                        isFavorite={false}
                        favoriteTitle={t.ui.addFavorite}
                        onToggleFavorite={() => toggleFavoriteTool(tool.id)}
                        onClick={() => setActiveTool(tool.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </nav>

      {/* Language toggle + collapse */}
      <div className="px-3 py-2 border-t border-[#333333] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#e0e0e0] transition-colors"
        >
          <span>🌐</span>
          <span>{locale === "zh" ? "EN" : "中"}</span>
        </button>
        <button
          type="button"
          title={t.ui.collapseSidebar}
          onClick={() => setCollapsed(true)}
          className="text-xs text-[#888] hover:text-[#e0e0e0] transition-colors p-1 rounded"
        >
          ◀
        </button>
      </div>
    </aside>
  );
}

function ToolItem({
  tool,
  locale,
  active,
  isFavorite,
  favoriteTitle,
  onToggleFavorite,
  onClick,
}: {
  tool: ToolDefinition;
  locale: Locale;
  active: boolean;
  isFavorite: boolean;
  favoriteTitle: string;
  onToggleFavorite: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
        active
          ? "bg-[#0e3a5c] text-white border-l-2 border-[#0078d4]"
          : "text-[#c0c0c0] hover:bg-[#2a2a2a] hover:text-[#e0e0e0]"
      }`}
    >
      <span className="text-base leading-none">{tool.icon}</span>
      <span className="truncate">{tool.name[locale]}</span>
      <span
        role="button"
        tabIndex={0}
        title={favoriteTitle}
        aria-label={favoriteTitle}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite();
          }
        }}
        className={`ml-auto text-xs transition-colors ${
          isFavorite ? "text-[#f5c451]" : "text-[#666] hover:text-[#f5c451]"
        }`}
      >
        {isFavorite ? "★" : "☆"}
      </span>
    </button>
  );
}

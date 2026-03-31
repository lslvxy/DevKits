# DevKits — Copilot Instructions

## 项目概述

DevKits 是一个基于 **Tauri 2 + React 18 + TypeScript** 的桌面端插件化开发者工具集（类似 DevUtils / DevToys）。
所有业务逻辑均在 TypeScript 侧完成，Rust 仅作为 Tauri 启动壳。

支持 **中文 / English 双语切换**，界面语言通过 Zustand 全局状态管理，默认中文。

## 技术栈

| 层 | 技术 | 版本 |
|---|---|---|
| 桌面框架 | Tauri | 2.x |
| 前端框架 | React (函数组件 + Hooks) | 18.x |
| 语言 | TypeScript (strict) | 5.x |
| 构建 | Vite | 5.x |
| CSS | Tailwind CSS | 4.x |
| 状态管理 | Zustand | 5.x |
| 代码编辑器 | @monaco-editor/react | 4.x |
| Lint/Format | Biome | 1.x |
| 测试 | Vitest + jsdom | 2.x |
| 包管理器 | pnpm（禁止 npm/yarn） | — |
| Node 版本管理 | n（禁止 nvm） | — |

## 常用命令

```bash
pnpm dev            # 启动 Vite dev server
pnpm tauri dev      # 启动 Tauri 开发模式（含前端 + 桌面壳）
pnpm build          # tsc + vite build
pnpm test           # vitest run
pnpm test:watch     # vitest watch
pnpm biome:check    # Biome lint + format 检查
pnpm biome:fix      # Biome 自动修复
```

## 架构与目录结构

```
src/
├── main.tsx                    # React 入口
├── App.tsx                     # 根组件：Sidebar + ToolPage/WelcomePage
├── index.css                   # Tailwind 入口
│
├── i18n/
│   └── index.ts                # 国际化：Locale / LocalizedString 类型、translations、getT()
│
├── core/                       # 框架核心（与具体工具无关）
│   ├── types.ts                # ToolDefinition, ToolCategory 等核心类型
│   ├── registry.ts             # 工具注册表（registerTool / getAllTools / getToolById）
│   ├── store.ts                # Zustand 全局状态（activeToolId, searchQuery, locale）
│   └── layout/
│       ├── Sidebar.tsx         # 左侧导航：分类 + 搜索 + 工具列表 + 语言切换按钮
│       ├── ToolPage.tsx        # 右侧工具页容器（React.Suspense 包裹 lazy 组件）
│       └── WelcomePage.tsx     # 首页
│
├── components/                 # 共享 UI 组件
│   ├── DualPanel.tsx           # 左右分栏（可拖拽调整宽度）
│   ├── CodeEditor.tsx          # Monaco 编辑器封装
│   ├── JsonViewer.tsx          # JSON 树形展示
│   └── CopyButton.tsx          # 一键复制按钮
│
└── tools/                      # 工具集（每个工具一个自包含目录）
    └── <tool-name>/
        ├── index.ts            # ToolDefinition 导出（named export `tool`）
        ├── <ToolName>.tsx      # 工具 UI 组件
        └── (可选子目录)         # 如 parsers/ 等纯逻辑模块

src-tauri/                      # Tauri Rust 后端（最小化）
├── src/main.rs                 # 仅 Tauri 启动代码
├── build.rs                    # tauri_build::build()
├── Cargo.toml
└── tauri.conf.json

tests/                          # 测试文件
├── setup.ts
├── fixtures/
└── parsers/                    # 解析器单元测试
```

## 插件化工具体系

### 核心类型

```typescript
// src/i18n/index.ts
type Locale = "zh" | "en";
type LocalizedString = { zh: string; en: string };

// src/core/types.ts
type ToolCategory = "text" | "codec" | "crypto" | "convert" | "generate" | "other";

type ToolDefinition = {
  id: string;                    // 唯一 ID，如 "base64"
  name: LocalizedString;         // 双语显示名称
  description: LocalizedString;  // 双语简短描述
  category: ToolCategory;        // 分类
  icon: string;                  // emoji 图标
  keywords: string[];            // 搜索关键词（中英文混合均可）
  component: React.LazyExoticComponent<React.ComponentType>;  // lazy 加载组件
};
```

### 添加新工具的步骤

1. 创建 `src/tools/<tool-name>/` 目录
2. 创建 `<ToolName>.tsx`：工具 UI 组件（named export，禁止 default export）
3. 创建 `index.ts`：导出 `ToolDefinition`，组件使用 `React.lazy()` 加载
4. 在 `src/core/registry.ts` 中 import 并调用 `registerTool()`
5. 在 `src/i18n/index.ts` 的 `Translations.tools` 中为该工具添加双语字符串

### index.ts 模板

```typescript
import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "<tool-id>",
  name: { zh: "<工具名称>", en: "<Tool Name>" },
  description: { zh: "<简短描述>", en: "<Short description>" },
  category: "<category>",
  icon: "<emoji>",
  keywords: ["keyword1", "keyword2", "关键词"],
  component: React.lazy(() =>
    import("./<ToolName>.tsx").then((m) => ({ default: m.<ToolName> }))
  ),
};
```

### 工具组件模板

```typescript
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

export function MyTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);
  // 使用 t.tools.myTool.someKey 访问当前语言的字符串
  ...
}
```

## 国际化 (i18n)

### 架构设计

i18n 系统采用**零依赖**的自定义方案，无需引入 react-i18next 等第三方库。

| 文件 | 职责 |
|---|---|
| `src/i18n/index.ts` | 类型定义、翻译字典、`getT()` 工厂函数 |
| `src/core/store.ts` | 持有 `locale: Locale` 状态（默认 `"zh"`）和 `setLocale` action |
| `src/core/layout/Sidebar.tsx` | 底部语言切换按钮（🌐 EN / 中） |

**避免循环依赖的关键原则**：`src/i18n/index.ts` **不**导入 `src/core/store.ts`。组件侧自行组合：

```typescript
// 在任意 React 组件中获取翻译
const locale = useStore((s) => s.locale);
const t = getT(locale);
```

### 核心 API

```typescript
// src/i18n/index.ts

export type Locale = "zh" | "en";

// 工具名称 / 描述使用此类型
export type LocalizedString = { zh: string; en: string };

// 完整翻译字典的类型（所有 UI + 所有工具字符串）
export type Translations = { ui: {...}; categories: {...}; tools: {...} };

// 根据 locale 返回对应语言的翻译字典
export function getT(locale: Locale): Translations;
```

### Translations 结构

```
translations
├── ui                    # 通用 UI（搜索栏、欢迎页、加载提示等）
├── categories            # 工具分类标签（text / codec / convert / generate / crypto / other）
└── tools
    ├── base64            # Base64 编解码
    ├── base64Image       # Base64 图片
    ├── timestamp         # 时间戳转换
    ├── uuid              # UUID 生成器
    ├── jwt               # JWT 解析
    ├── jsonFormatter     # JSON 格式化
    ├── cryptoTools       # 加解密工具
    ├── csvJson           # CSV/JSON 转换
    ├── hexAscii          # Hex/ASCII 转换
    ├── logParser         # 日志解析器
    ├── mermaid           # Mermaid 流程图
    ├── plantuml          # PlantUML 流程图
    ├── qrcode            # QR Code
    ├── randomString      # 随机字符串
    ├── regexTester       # 正则表达式
    ├── rsaKeygen         # RSA 密钥生成
    ├── sqlFormat         # SQL 格式化
    ├── sqlPojo           # SQL → POJO
    ├── textDiff          # 文本对比
    ├── urlCodec          # URL 编解码
    ├── yamlJson          # YAML/JSON 转换
    └── cron              # Cron 表达式
```

### 语言切换

语言偏好存储在 Zustand store 中（内存，非持久化）。切换按钮位于 Sidebar 底部：

```typescript
const { locale, setLocale } = useStore();
// 切换：
setLocale(locale === "zh" ? "en" : "zh");
```

### 搜索跨语言匹配

Sidebar 的工具搜索会同时匹配中英文名称、描述和 keywords：

```typescript
tool.name.zh.toLowerCase().includes(q) ||
tool.name.en.toLowerCase().includes(q) ||
tool.description.zh.toLowerCase().includes(q) ||
tool.description.en.toLowerCase().includes(q) ||
tool.keywords.some((k) => k.toLowerCase().includes(q))
```

## 编码规范

### 文件命名
- TypeScript 模块：`kebab-case.ts`
- React 组件：`PascalCase.tsx`

### 导出
- 每个工具目录的 `index.ts` 为唯一出口
- 使用 named export，**禁止 default export**

### 组件
- 函数组件 + Hooks only，禁止 class 组件
- React 严格模式

### 类型
- 业务类型用 `type`
- 需要 `implements` / `extends` 时用 `interface`

### 样式
- Tailwind utility class 优先
- 深色主题：背景 `#1e1e1e`，文字 `#d4d4d4`（VS Code 风格）

### 解析器（parsers/）
- 纯函数，零副作用，零 DOM 依赖
- 可独立于 React 运行和测试
- 永远不 throw，返回 `ParseResult` 兜底（`success: false`）
- 必须有对应的 Vitest 单元测试

### Biome 格式化规则
- 缩进：2 空格
- 引号：双引号
- 尾逗号：ES5 规则
- 行宽：100 字符

## 注意事项

- Rust 侧不写业务逻辑，所有功能在 TypeScript 完成
- 界面支持中文（默认）和英文双语，**禁止在组件中硬编码中文字符串**，一律通过 `getT(locale)` 获取
- `ToolDefinition.name` 和 `ToolDefinition.description` 类型为 `LocalizedString`，不再是 `string`
- `CATEGORY_LABELS` 已从 `src/core/types.ts` 移除，分类标签改为从 `getT(locale).categories` 读取
- 首要支持 macOS，后续考虑 Windows/Linux
- import 路径带 `.ts` / `.tsx` 后缀

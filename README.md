# DevKits

> 基于 **Tauri 2 + React 18 + TypeScript** 的桌面端开发者工具集。
> A desktop developer toolbox built on **Tauri 2 + React 18 + TypeScript**.

![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)

---

## 目录 / Contents

- [功能概览](#功能概览--built-in-tools)
- [使用手册](#使用手册--user-manual)
- [开发环境搭建](#开发环境搭建--dev-setup)
- [私有工具 / 三方集成](#私有工具--三方集成--private-tools--third-party-integration)
- [架构说明](#架构说明--architecture)
- [开发规范](#开发规范--development-guide)

---

## 功能概览 / Built-in Tools

共 22 个内置工具，按分类组织：

### 📝 文本处理 (text)

| 图标 | 工具 | 描述 |
|------|------|------|
| 📄 | **JSON 格式化** / JSON Formatter | 格式化、压缩、校验、转义 JSON 数据 |
| 📊 | **文本对比** / Text Diff | 对比两段文本的差异（行级 diff） |
| 🔍 | **正则表达式** / Regex Tester | 正则表达式测试与匹配高亮 |
| 🗄️ | **SQL 格式化** / SQL Formatter | 格式化 SQL 语句 |
| 📋 | **日志解析器** / Log Parser | 解析 Java 日志，支持 Logback/Log4j、toString、KV 格式 |

### 🔄 编解码 (codec)

| 图标 | 工具 | 描述 |
|------|------|------|
| 🔄 | **Base64 编解码** / Base64 Codec | Base64 编码与解码 |
| 🖼️ | **Base64 图片** / Base64 Image | 图片与 Base64 字符串互转 |
| 🔑 | **JWT 解析** / JWT Decoder | 解析 JWT Token 的 Header 和 Payload |
| 🔢 | **Hex/ASCII 转换** / Hex/ASCII Converter | Hex 与 ASCII 文本互转 |
| 🔗 | **URL 编解码** / URL Codec | URL 编码（percent-encoding）与解码 |

### 🔁 格式转换 (convert)

| 图标 | 工具 | 描述 |
|------|------|------|
| 🕐 | **时间戳转换** / Timestamp Converter | 时间戳与可读日期互转（支持毫秒） |
| 🔀 | **YAML/JSON 转换** / YAML/JSON Converter | YAML 与 JSON 格式互转 |
| 📋 | **CSV/JSON 转换** / CSV/JSON Converter | CSV 与 JSON 格式互转 |
| ☕ | **SQL → POJO** | CREATE TABLE SQL 转换为 Java POJO 类 |

### ✨ 生成 (generate)

| 图标 | 工具 | 描述 |
|------|------|------|
| 🔧 | **UUID 生成器** / UUID Generator | 生成 UUID v4 / v7 / NanoID |
| 🎲 | **随机字符串** / Random String | 生成可配置的随机字符串 |
| 📈 | **Mermaid 流程图** / Mermaid Diagram | 使用 Mermaid 语法绘制流程图 |
| 🎯 | **PlantUML 流程图** / PlantUML Diagram | 使用 PlantUML 语法绘制 UML 图 |
| 📱 | **QR Code** | 生成和扫描解析二维码 |

### 🔐 加密 (crypto)

| 图标 | 工具 | 描述 |
|------|------|------|
| 🔐 | **加解密工具** / Crypto Tools | Hash（MD5/SHA）、AES 加解密、HMAC |
| 🗝️ | **RSA 密钥生成** / RSA Key Generator | 生成 RSA 公私钥对（PEM 格式） |

### 🔩 其他 (other)

| 图标 | 工具 | 描述 |
|------|------|------|
| ⏰ | **Cron 表达式** / Cron Expression | Cron 表达式可视化创建与解析 |

---

## 使用手册 / User Manual

### 主界面布局

```
┌─────────────────┬──────────────────────────────────┐
│   侧边栏          │   工具区域                         │
│   Sidebar        │   Tool Panel                      │
│                  │                                   │
│  🔍 搜索框        │   <当前选中工具的 UI>               │
│  ─────────────  │                                   │
│  📝 文本处理      │                                   │
│    JSON 格式化    │                                   │
│    文本对比       │                                   │
│    ...           │                                   │
│  🔄 编解码        │                                   │
│    ...           │                                   │
│  ─────────────  │                                   │
│  🌐 EN / 中      │                                   │
└─────────────────┴──────────────────────────────────┘
```

### 工具搜索

侧边栏顶部有搜索框，支持**中英文混合搜索**，同时匹配：
- 工具名称（中文 + 英文）
- 工具描述（中文 + 英文）
- 关键词（keywords）

例如输入 `base64`、`编码`、`格式化`、`diff` 均可快速定位到对应工具。

### 语言切换

侧边栏底部有语言切换按钮（`🌐 EN` / `中`），点击即可在**中文**和**英文**之间切换。语言偏好在 Zustand store 中持久化（`devkits-store`）。

### 收藏工具

点击工具名称旁的⭐图标可将工具加入收藏。收藏的工具会出现在侧边栏顶部的**收藏分类**下，方便快速访问。收藏记录持久化存储（`devkits-store`）。

### 侧边栏自动折叠

在设置中可开启**侧边栏自动折叠**（`sidebarAutoCollapse`）：选中工具后侧边栏自动收起，最大化工具工作区。

### 输入内容持久化

所有工具的输入框内容在**页面切换**和**应用重启**后均自动保留，无需手动复制。  
技术实现：`useToolDraft` hook 将输入写入 `localStorage`，键格式为 `devkits-draft:<工具id>:<字段名>`。

---

## 开发环境搭建 / Dev Setup

### 前置要求

- [Node.js](https://nodejs.org/) ≥ 20（推荐用 `n` 管理版本，**禁止 nvm**）
- [pnpm](https://pnpm.io/) ≥ 9（**禁止 npm/yarn**）
- [Rust](https://rustup.rs/) + Tauri CLI（参见 [Tauri 2 安装指南](https://tauri.app/start/prerequisites/)）

### 安装依赖

```bash
pnpm install
```

### 常用命令

```bash
pnpm dev            # 启动 Vite 前端开发服务器
pnpm tauri dev      # 启动 Tauri 桌面开发模式（含热更新）
pnpm build          # tsc 编译 + Vite 构建（生产包）
pnpm tauri build    # 打包桌面应用（macOS .dmg / Windows .msi）

pnpm test           # 运行单元测试（Vitest）
pnpm test:watch     # 监听模式运行测试

pnpm biome:check    # Biome lint + format 检查
pnpm biome:fix      # Biome 自动修复
```

---

## 私有工具 / 三方集成 / Private Tools & Third-Party Integration

DevKits 支持将私有工具放在**独立 Git 仓库**（`src/tools-private/`），与主仓库完全隔离，开箱自动注册。

### 工作原理

`src/core/registry.ts` 通过 Vite 的 `import.meta.glob` 自动发现并注册 `src/tools-private/` 下所有工具：

```typescript
const _privateModules = import.meta.glob<{ tool: ToolDefinition }>(
  "../tools-private/*/index.ts",
  { eager: true },
);
for (const mod of Object.values(_privateModules)) {
  if (mod?.tool) {
    registerTool(mod.tool);
  }
}
```

只要在 `src/tools-private/<your-tool>/index.ts` 中导出合法的 `tool: ToolDefinition`，即可自动出现在应用侧边栏中，**无需修改主仓库任何代码**。

### 接入步骤

**1. 创建或关联私有工具仓库**

```bash
# 方式 A：git submodule（推荐，保持独立版本历史）
git submodule add git@github.com:your-org/your-private-tools.git src/tools-private

# 方式 B：直接克隆（不纳入主仓库版本管理）
git clone git@github.com:your-org/your-private-tools.git src/tools-private
```

> `src/tools-private/` 已在 `.gitignore` 中，不会提交到主仓库。

**2. 在私有仓库中创建工具目录**

```
your-private-tools/
└── my-tool/
    ├── index.ts          # ToolDefinition 导出（必须）
    └── MyTool.tsx        # 工具 UI 组件
```

**3. 编写 `index.ts`**

```typescript
import React from "react";
// 从主仓库 core 模块导入类型（相对路径）
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "my-tool",                           // 全局唯一 ID
  name: { zh: "我的工具", en: "My Tool" }, // 双语名称
  description: {
    zh: "这是一个私有工具示例",
    en: "A private tool example",
  },
  category: "other",                       // 见分类说明
  icon: "🛠️",                             // emoji 图标
  keywords: ["my-tool", "私有工具"],        // 搜索关键词
  component: React.lazy(() =>
    import("./MyTool.tsx").then((m) => ({ default: m.MyTool }))
  ),
};
```

**4. 编写工具 UI 组件 `MyTool.tsx`**

```typescript
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

export function MyTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);

  return (
    <div className="p-4 text-[#d4d4d4]">
      {/* 你的工具 UI */}
    </div>
  );
}
```

> **注意**：使用 named export，**禁止 default export**。

### ToolDefinition 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | ✅ | 全局唯一标识符，建议用 kebab-case |
| `name` | `{ zh: string; en: string }` | ✅ | 侧边栏显示名称（支持双语） |
| `description` | `{ zh: string; en: string }` | ✅ | 工具简短描述（搜索时匹配） |
| `category` | `ToolCategory` | ✅ | 分类，决定侧边栏归属组 |
| `icon` | `string` | ✅ | emoji 图标，显示在侧边栏列表 |
| `keywords` | `string[]` | ✅ | 搜索关键词（中英文混合均可） |
| `component` | `React.LazyExoticComponent` | ✅ | `React.lazy()` 包裹的组件，按需加载 |

**ToolCategory 可选值：**

| 值 | 中文分类 | 说明 |
|----|---------|------|
| `"text"` | 文本处理 | 文本操作、格式化、对比 |
| `"codec"` | 编解码 | 编码转换（Base64、Hex、URL等） |
| `"convert"` | 格式转换 | 数据格式互转（YAML/JSON、CSV等） |
| `"generate"` | 生成 | 内容生成（UUID、随机字符串、图表等） |
| `"crypto"` | 加密 | 加密、哈希、密钥生成 |
| `"other"` | 其他 | 不属于以上分类的工具 |

### 可用共享 API

#### `useToolDraft` — 持久化输入

在工具中替代 `useState("")`，输入内容自动持久化到 `localStorage`：

```typescript
import { useToolDraft } from "../../core/useToolDraft.ts";

export function MyTool() {
  const [input, setInput] = useToolDraft("my-tool:input");
  const [config, setConfig] = useToolDraft("my-tool:config", "default-value");

  return <textarea value={input} onChange={(e) => setInput(e.target.value)} />;
}
```

- `key` 格式建议：`"<tool-id>:<field-name>"`（存储键为 `devkits-draft:<key>`）
- `initial`（可选，默认 `""`）：localStorage 中无值时的初始内容

#### `CodeEditor` — Monaco 代码编辑器

```typescript
import { CodeEditor } from "../../components/CodeEditor.tsx";

// 只读展示（常用于输出区域）
<CodeEditor value={output} language="json" readOnly />

// 可编辑输入
<CodeEditor value={input} onChange={setInput} language="sql" />
```

支持所有 Monaco 内置语言：`json`、`yaml`、`sql`、`javascript`、`typescript`、`markdown`、`plaintext` 等。

#### `DualPanel` — 左右分栏布局

```typescript
import { DualPanel } from "../../components/DualPanel.tsx";

<DualPanel
  left={<textarea value={input} onChange={(e) => setInput(e.target.value)} />}
  right={<CodeEditor value={output} language="json" readOnly />}
/>
```

左右宽度可由用户拖拽调整。

#### `CopyButton` — 一键复制

```typescript
import { CopyButton } from "../../components/CopyButton.tsx";

<CopyButton text={output} />
```

点击后自动复制文本到剪贴板，提供短暂的视觉反馈。

#### `getT` — 国际化翻译

```typescript
import { getT } from "../../i18n/index.ts";
import { useStore } from "../../core/store.ts";

export function MyTool() {
  const locale = useStore((s) => s.locale);
  const t = getT(locale);

  return <span>{t.ui.loading}</span>; // "加载中..." 或 "Loading..."
}
```

如需为私有工具添加专属翻译字符串，**在私有仓库内自行维护翻译字典**（不修改主仓库 `src/i18n/index.ts`）：

```typescript
const myToolI18n = {
  zh: { title: "我的工具", placeholder: "请输入..." },
  en: { title: "My Tool", placeholder: "Enter here..." },
};

// 在组件中使用
const i18n = myToolI18n[locale];
return <h2>{i18n.title}</h2>;
```

### 纯逻辑模块（parsers/）

对于复杂数据处理，建议拆分为纯函数模块放在 `parsers/` 子目录下：

```
my-tool/
├── index.ts
├── MyTool.tsx
└── parsers/
    └── my-parser.ts    # 纯函数，零副作用，零 DOM 依赖
```

解析器规范：
- 永远不 `throw`，返回 `{ success: true, data }` 或 `{ success: false, error: string }`
- 不依赖任何 DOM / window API
- 可独立于 React 运行和测试（Vitest）

---

## 架构说明 / Architecture

```
┌──────────────────────────────────────────────┐
│              Tauri 2 (Rust Shell)            │
│  main.rs: 仅启动 Tauri，无业务逻辑             │
└────────────────────┬─────────────────────────┘
                     │ WebView
┌────────────────────▼─────────────────────────┐
│              React 18 (Frontend)             │
│                                              │
│  App.tsx                                     │
│  ├── Sidebar.tsx    (Zustand: locale, active)│
│  └── ToolPage.tsx   (React.Suspense + lazy)  │
│                                              │
│  core/                                       │
│  ├── registry.ts   工具注册 + 私有工具自发现   │
│  ├── store.ts      Zustand (persist)         │
│  ├── types.ts      ToolDefinition 类型定义    │
│  └── useToolDraft  localStorage 输入持久化    │
│                                              │
│  tools/            22 个内置工具              │
│  tools-private/    私有工具（自动发现）        │
│                                              │
│  components/       共享 UI 组件               │
│  i18n/             零依赖国际化               │
└──────────────────────────────────────────────┘

技术栈：Vite 5 | Tailwind CSS 4 | Monaco Editor | Zustand 5 | Biome
```

### 关键设计决策

- **所有业务逻辑在 TypeScript 侧完成**，Rust 仅作为 Tauri 启动包装
- **插件化工具体系**：每个工具自包含，`registry.ts` 统一注册，私有工具通过 `import.meta.glob` 自动发现
- **零依赖 i18n**：`LocalizedString = { zh; en }` + `getT(locale)` 工厂函数，无第三方 i18n 库
- **深色主题**：全局使用 VS Code 风格配色（背景 `#1e1e1e`，文字 `#d4d4d4`）

---

## 开发规范 / Development Guide

### 添加内置工具

1. 创建 `src/tools/<tool-name>/` 目录
2. 创建 `<ToolName>.tsx`：工具 UI（named export）
3. 创建 `index.ts`：导出 `tool: ToolDefinition`（`React.lazy` 加载组件）
4. 在 `src/core/registry.ts` 中 import 并调用 `registerTool()`
5. 在 `src/i18n/index.ts` 的 `translations.tools` 中添加双语字符串

### 代码风格

- 函数组件 + Hooks，禁止 class 组件
- Named export，禁止 default export
- 业务类型用 `type`，需要继承时用 `interface`
- Import 路径带 `.ts` / `.tsx` 后缀
- Biome 格式化：2 空格缩进、双引号、100 字符行宽

### 测试

单元测试放在 `tests/` 目录，使用 Vitest + jsdom：

```bash
pnpm test           # 单次运行
pnpm test:watch     # 监听模式
```

解析器模块需要有对应的单元测试覆盖。

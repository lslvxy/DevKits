# DevKits — Copilot Instructions

## 项目概述

DevKits 是一个基于 **Tauri 2 + React 18 + TypeScript** 的桌面端插件化开发者工具集（类似 DevUtils / DevToys）。
所有业务逻辑均在 TypeScript 侧完成，Rust 仅作为 Tauri 启动壳。

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
├── core/                       # 框架核心（与具体工具无关）
│   ├── types.ts                # ToolDefinition, ToolCategory 等核心类型
│   ├── registry.ts             # 工具注册表（registerTool / getAllTools / getToolById）
│   ├── store.ts                # Zustand 全局状态（activeToolId, searchQuery）
│   └── layout/
│       ├── Sidebar.tsx         # 左侧导航：分类 + 搜索 + 工具列表
│       ├── ToolPage.tsx        # 右侧工具页容器（React.Suspense 包裹 lazy 组件）
│       └── WelcomePage.tsx     # 首页
│
├── components/                 # 共享 UI 组件
│   ├── DualPanel.tsx           # 左右分栏（可拖拽调整宽度）
│   ├── CodeEditor.tsx          # Monaco 编辑器封装
│   ├── JsonViewer.tsx          # JSON 树形展示
│   └── CopyButton.tsx         # 一键复制按钮
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
type ToolCategory = "text" | "codec" | "crypto" | "convert" | "generate" | "other";

type ToolDefinition = {
  id: string;                    // 唯一 ID，如 "base64"
  name: string;                  // 显示名称
  description: string;           // 简短描述
  category: ToolCategory;        // 分类
  icon: string;                  // emoji 图标
  keywords: string[];            // 搜索关键词
  component: React.LazyExoticComponent<React.ComponentType>;  // lazy 加载组件
};
```

### 添加新工具的步骤

1. 创建 `src/tools/<tool-name>/` 目录
2. 创建 `<ToolName>.tsx`：工具 UI 组件（named export，禁止 default export）
3. 创建 `index.ts`：导出 `ToolDefinition`，组件使用 `React.lazy()` 加载
4. 在 `src/core/registry.ts` 中 import 并调用 `registerTool()`

### index.ts 模板

```typescript
import React from "react";
import type { ToolDefinition } from "../../core/types.ts";

export const tool: ToolDefinition = {
  id: "<tool-id>",
  name: "<工具名称>",
  description: "<简短描述>",
  category: "<category>",
  icon: "<emoji>",
  keywords: ["keyword1", "keyword2"],
  component: React.lazy(() =>
    import("./<ToolName>.tsx").then((m) => ({ default: m.<ToolName> }))
  ),
};
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
- 界面文案暂用中文
- 首要支持 macOS，后续考虑 Windows/Linux
- import 路径带 `.ts` / `.tsx` 后缀

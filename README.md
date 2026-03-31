# DevKits — 插件化开发者工具集

## 概述

基于 Tauri 2 + React + TypeScript 构建的桌面端开发者工具集（类似 DevUtils / DevToys），首个核心工具为 Java 日志解析器，后续持续扩展更多研发小工具。

## 基础要求

| 项 | 规范 | 备注 |
|---|---|---|
| OS | macOS (首要) | 后续考虑 Windows/Linux |
| Node 版本管理 | `n` | 禁止使用 nvm |
| 包管理器 | `pnpm` | 禁止使用 npm/yarn |
| Node 版本 | 最新 LTS | |
| 桌面框架 | Tauri 2 | Rust 只写 main.rs 壳，业务逻辑全在 TS |
| 前端框架 | React + TypeScript | 严格模式, 函数组件 + Hooks only |
| 构建工具 | Vite | |
| CSS | Tailwind CSS 4 | |
| 代码规范 | Biome | lint + format 二合一，替代 ESLint + Prettier |
| 测试 | Vitest | 解析器必须有单元测试 |
| 状态管理 | Zustand | |
| 代码编辑器 | @monaco-editor/react | |
| Rust 工具链 | rustup stable | |

## 代码规范与约定

- 文件命名: `kebab-case.ts` / `PascalCase.tsx` (组件)
- 导出: 每个工具目录的 `index.ts` 为唯一出口，使用 named export，禁止 default export
- 组件: 函数组件 + Hooks，禁止 class 组件
- 类型: 业务类型用 `type`，需要 implements/extends 时用 `interface`
- 样式: Tailwind utility class 优先，复杂动画可用 CSS Modules
- 解析器: 纯函数，零副作用，零 DOM 依赖，可独立于 React 运行和测试
- 错误处理: 解析器永远不 throw，返回 FallbackResult 兜底
- 国际化: 界面文案暂用中文，后续可切换

## 项目目录结构

```
devkits/
├── src-tauri/                       # Tauri Rust 后端 (最小化)
│   ├── src/
│   │   └── main.rs                  # 仅 Tauri 启动代码，不写业务逻辑
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                             # React 前端
│   ├── main.tsx                     # React 入口
│   ├── App.tsx                      # 根组件: 布局 + 路由
│   ├── index.css                    # Tailwind 入口
│   │
│   ├── core/                        # 框架核心 (与具体工具无关)
│   │   ├── types.ts                 # ToolDefinition 等核心类型
│   │   ├── registry.ts              # 工具注册表
│   │   ├── store.ts                 # Zustand 全局状态 (当前工具、搜索词等)
│   │   └── layout/
│   │       ├── Sidebar.tsx          # 左侧导航: 分类 + 搜索 + 工具列表
│   │       ├── ToolPage.tsx         # 右侧工具页容器
│   │       └── WelcomePage.tsx      # 首页 / 无工具选中时显示
│   │
│   ├── components/                  # 共享 UI 组件
│   │   ├── DualPanel.tsx            # 左右分栏 (可拖拽调整宽度)
│   │   ├── CodeEditor.tsx           # Monaco 编辑器封装
│   │   ├── JsonViewer.tsx           # JSON 树形展示 (可折叠/搜索/复制)
│   │   └── CopyButton.tsx          # 一键复制按钮
│   │
│   └── tools/                       # 工具集 (每个工具一个自包含目录)
│       ├── log-parser/              # 日志解析器
│       │   ├── index.ts             # ToolDefinition 导出
│       │   ├── LogParser.tsx        # 工具 UI
│       │   └── parsers/             # 解析引擎 (纯 TS, 零 UI 依赖)
│       │       ├── types.ts         # LogParser 接口, ParseResult 类型
│       │       ├── chain.ts         # 解析器链调度
│       │       ├── json-detect.ts   # JSON 探测解析器
│       │       ├── log-framework.ts # 日志框架行解析器
│       │       ├── to-string.ts     # toString 递归解析器 (核心)
│       │       ├── kv.ts            # KV 解析器
│       │       └── fallback.ts      # 兜底解析器
│       │
│       ├── json-formatter/          # JSON 格式化 (Phase 3)
│       │   ├── index.ts
│       │   └── JsonFormatter.tsx
│       │
│       └── ...                      # 后续工具按相同结构添加
│
├── tests/                           # 测试
│   └── fixtures/
│       └── sample-log.txt           # 真实日志样本 (见下方测试数据)
│
├── biome.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## 核心类型定义

```typescript
// src/core/types.ts

type ToolCategory = 'text' | 'codec' | 'crypto' | 'convert' | 'generate' | 'other'

type ToolDefinition = {
  id: string                          // URL-safe 唯一标识, 如 'log-parser'
  name: string                        // 显示名, 如 '日志解析器'
  description: string                 // 一句话描述
  category: ToolCategory
  icon: string                        // emoji 或 lucide icon name
  keywords: string[]                  // 搜索关键词 (中英文)
  component: React.LazyExoticComponent<React.ComponentType>  // lazy(() => import(...))
}

// src/tools/log-parser/parsers/types.ts

type ParseResult = {
  success: boolean
  data: Record<string, unknown> | null  // 解析后的 JSON 对象
  raw: string                           // 原始输入
  parserName: string                    // 命中的解析器名称
  confidence: number                    // 置信度 0-1
  error?: string                        // 解析失败时的错误信息
}

type LogParser = {
  name: string
  detect(input: string): number         // 返回置信度 0-1, 0 表示不匹配
  parse(input: string): ParseResult
}
```

## 解析器链设计

### 调度逻辑 (chain.ts)

1. 对所有注册的解析器调用 `detect(input)` 获取置信度
2. 按置信度降序排列
3. 对置信度 > 0 的解析器依次调用 `parse(input)`
4. 返回第一个 `success: true` 的结果
5. 全部失败则返回 FallbackParser 的结果

### 解析器列表 (按优先级)

| # | 解析器 | 匹配规则 | 置信度 |
|---|---|---|---|
| 1 | JsonDetectParser | 输入以 `{` 或 `[` 开头且 JSON.parse 成功 | 1.0 |
| 2 | LogFrameworkParser | 匹配 `^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}` 开头 | 0.9 |
| 3 | ToStringParser | 匹配 `ClassName@hash[` 或 `ClassName[` 或 `ClassName{` | 0.8 |
| 4 | KVParser | 匹配多个 `key=value` 模式 | 0.5 |
| 5 | FallbackParser | 任何输入 | 0.1 |

### toString 递归解析器 — 详细规则

这是最复杂的解析器，处理 Java 对象的 `toString()` 输出。

**输入模式:**
- `ClassName@hexHash[key=value, key=value]` (Commons ToStringBuilder)
- `ClassName[key=value;key=value;]` (自定义 toString, 分号分隔)
- `ClassName{key=value, key=value}` (另一种风格)
- 可混合出现在同一日志中

**解析规则:**

1. **对象识别**: 匹配 `(包名.)*类名(@十六进制)?[` 或 `{` 开始
2. **分隔符自适应**: 进入新对象后，扫描第一个顶层分隔符确定是 `,` 还是 `;`
3. **key=value 拆分**: `=` 左边是 key，右边是 value
4. **value 类型推断** (按优先级):
   - `<null>` 或 `null` → `null`
   - `true` / `false` → boolean
   - 纯数字 → number
   - 以 `{` 开头 → 先尝试 `JSON.parse()`，成功则作为 JSON 值；失败则作为 toString map 递归解析
   - 以 `[` 开头 → 判断: 前面有 ClassName 则递归 toString 对象；内容像 JSON array 则 `JSON.parse()`；否则作为 toString 列表
   - 以 `ClassName@hash[` 或 `ClassName[` 开头 → 递归 toString 对象
   - Java Date 格式 (`Mon Jan 01 00:00:00 TZ 2026`) → 保留为字符串
   - 其余 → 字符串
5. **括号深度**: 维护 `[]` `{}` `()` 三种括号的深度计数，只在深度为 0 时才识别分隔符
6. **引号处理**: `'单引号'` 和 `"双引号"` 内的内容不拆分
7. **输出**: `{ "_class": "ClassName", "_hash": "hexHash"(可选), ...parsed_fields }`

## UI 设计

### 主布局

```
┌──────────────────────────────────────────────────────────────┐
│  DevKits                                         ─  □  ✕    │
├────────────┬─────────────────────────────────────────────────┤
│  🔍 搜索    │                                                │
│            │   工具标题                                      │
│  📋 文本    │   工具描述                                      │
│   日志解析  │  ┌───────────────────────────────────────────┐  │
│   JSON格式化│  │                                           │  │
│            │  │          工具内容区                         │  │
│  🔄 编解码  │  │                                           │  │
│   Base64   │  │                                           │  │
│            │  │                                           │  │
│  🕐 转换    │  └───────────────────────────────────────────┘  │
│   时间戳   │                                                │
│            │                                                │
│  🔧 生成    │                                                │
│   UUID     │                                                │
└────────────┴─────────────────────────────────────────────────┘
```

- **窗口**: 默认 1200x800, 最小 800x600
- **Sidebar**: 固定宽度 220px, 深色背景
- **主色调**: 暗色主题 (dark mode 为默认), 参考 VS Code / DevUtils 风格
- **Sidebar 分组**: 按 `category` 自动分组, 组名显示中文
- **选中态**: 高亮当前工具, 左边框 accent color

### 日志解析器 UI

```
┌────────────────────────┬────────────────────────────────┐
│  Input                 │  Output (JSON)                 │
│  ┌──────────────────┐  │  ┌──────────────────────────┐  │
│  │ Monaco Editor    │  │  │ JsonViewer               │  │
│  │ (plaintext)      │  │  │ (可折叠/搜索/复制)        │  │
│  │                  │  │  │                          │  │
│  │                  │  │  │                          │  │
│  └──────────────────┘  │  └──────────────────────────┘  │
├────────────────────────┴────────────────────────────────┤
│ [Auto] [toString] [KV] [Logback]  │ Parser: toString    │
│                                   │ Confidence: 95%     │
└───────────────────────────────────┴─────────────────────┘
```

- **左侧**: Monaco Editor, language=plaintext, 支持粘贴和拖拽文件
- **右侧**: JSON 树形展示, 支持折叠/展开, 节点可单独复制
- **分栏**: 可拖拽调整左右宽度, 默认 50:50
- **底部状态栏**: 当前解析模式 Tab + 右侧显示命中解析器信息
- **实时解析**: 输入变化后 debounce 300ms 自动解析


## 任务列表

### Phase 1: 项目骨架与基础框架

**T1.1 环境初始化**
- 用 `n` 安装/确认 Node LTS
- `pnpm create tauri-app devkits` 初始化 Tauri 2 + React + TS + Vite 项目
- 安装 rustup + stable toolchain
- 验证 `pnpm tauri dev` 能启动空窗口
- 依赖: 无 | 产出: 可运行的空 Tauri 窗口

**T1.2 基础依赖安装与配置**
- 安装 Tailwind CSS 4 + 配置
- 安装 Biome + 配置 `biome.json` (lint + format 规则)
- 安装 Vitest + 配置
- 安装 Monaco Editor (`@monaco-editor/react`)
- 安装 Zustand
- 依赖: T1.1 | 产出: 工具链就绪

**T1.3 框架核心 — 工具注册与布局**
- 按"核心类型定义"实现 `ToolDefinition` 类型
- 实现工具注册表 `registry.ts`
- 实现主布局: Sidebar + 工具区 (参考 UI 设计)
- 按 `category` 自动分组导航
- 路由: 用 Zustand 管理当前选中工具 (无需 React Router)
- 实现共享组件: `DualPanel`, `CodeEditor`, `CopyButton`
- 依赖: T1.2 | 产出: 可以注册空工具并在 sidebar 中切换

**T1.4 占位工具验证**
- 创建一个最简 Hello World 工具，验证注册→导航→渲染完整链路
- 验证后删除此占位工具
- 依赖: T1.3 | 产出: 插件机制验证通过

### Phase 2: 日志解析器 (核心功能)

**T2.1 解析器基础架构**
- 按"核心类型定义"实现 `LogParser` 接口和 `ParseResult` 类型
- 实现解析器链调度 `chain.ts` (按置信度选最优，逻辑见"调度逻辑")
- 实现 FallbackParser
- 实现 JsonDetectParser
- 每个解析器必须有单元测试
- 依赖: T1.2 (只需 Vitest) | 可与 T1.3 并行

**T2.2 日志框架行解析器**
- 正则匹配: `timestamp [thread] LEVEL logger - [traceContext]message`
- 提取字段: timestamp, thread, level, logger, traceContext (数组), message
- message 部分递归送入解析器链继续解析
- 用真实日志样本编写单元测试
- 依赖: T2.1

**T2.3 toString 递归解析器 (核心难点)**
- 严格按照"toString 递归解析器 — 详细规则"实现
- 编写单元测试覆盖: 嵌套对象、混合分隔符、内嵌 JSON、`<null>`、boolean/number 转型、Java Date
- 用真实日志样本的各个嵌套层级分别测试
- 依赖: T2.1 | 可与 T2.2 并行

**T2.4 KV 解析器**
- 匹配 `key=value` 模式，支持空格/逗号/分号分隔
- 单元测试
- 依赖: T2.1 | 可与 T2.2/T2.3 并行

**T2.5 日志解析器 UI**
- 创建 `tools/log-parser/` 目录，按插件架构导出 ToolDefinition
- UI 布局参考"日志解析器 UI"设计图
- 实时解析 (debounce 300ms)
- 状态栏显示: 命中解析器名 + 置信度
- 依赖: T1.3 + T2.1~T2.4

**T2.6 集成测试**
- 用"测试数据"中的真实日志样本做端到端测试
- 必须通过"解析验证要求"中列出的所有字段校验
- 依赖: T2.5

### Phase 3: 补充工具 & 完善体验

**T3.1 JSON 格式化工具** — 格式化 / 压缩 / 校验 | 依赖: T1.3
**T3.2 Base64 编解码工具** | 依赖: T1.3
**T3.3 时间戳转换工具** — 时间戳 ↔ 可读日期 | 依赖: T1.3
**T3.4 UUID 生成工具** | 依赖: T1.3

> T3.1-T3.4 互相无依赖，可全部并行

**T3.5 全局搜索 & 快捷键**
- Sidebar 搜索框模糊匹配工具名 + keywords
- Cmd+K 全局搜索 (类 Spotlight)
- 依赖: T3.1-T3.4

### Phase 4: 持续扩展 (按需)

- JWT 解析、URL 编解码、正则测试、Diff 对比、MD5/SHA...
- 剪贴板智能检测 (粘贴内容自动路由到对应工具)
- 用户偏好持久化 (暗色模式、最近使用等)

## 任务依赖图

```
T1.1 → T1.2 → T1.3 → T1.4
         │       │
         │       ├→ T2.5 (UI) ←─┐
         │       │               │
         │       ├→ T3.1 ┐       │
         │       ├→ T3.2 ├→ T3.5 │
         │       ├→ T3.3 │       │
         │       └→ T3.4 ┘       │
         │                       │
         └→ T2.1 ──→ T2.2 ──────┤
              ├────→ T2.3 ───────┤
              └────→ T2.4 ───────┘
                                 └→ T2.6
```

## 验收标准

1. `pnpm tauri dev` 启动正常，窗口显示 Sidebar + 工具区，暗色主题
2. 粘贴"测试数据"中的真实日志 → Auto 模式完整解析为 JSON
3. "解析验证要求"中列出的所有字段路径和值均正确
4. 手动切换 toString / KV / Logback 模式均能正确解析对应格式
5. 新建空工具目录 + 导出 ToolDefinition → 自动出现在 Sidebar
6. `pnpm test` 所有解析器单元测试通过
7. `pnpm biome check` 无 lint 错误

## 验证

1. `pnpm tauri dev` 启动正常,窗口显示 Sidebar + 工具区
2. 粘贴真实日志样本,Auto 模式下完整解析为 JSON,所有字段无遗漏
3. 手动切换 toString / KV / Logback 模式均能正确解析对应格式
4. 新建一个空工具目录 + 导出 ToolDefinition → 自动出现在 Sidebar (验证插件机制)
5. `pnpm test` 所有解析器单元测试通过
6. `pnpm biome check` 无 lint 错误
7. `pnpm tauri build` 能打出 macOS DMG

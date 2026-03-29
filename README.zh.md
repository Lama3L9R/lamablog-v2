<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
  <h1 style="margin: 0;">Kūkan</h1>
  <div style="display: flex; gap: 0.5rem;">
    <a href="./README.md" style="padding: 0.5rem 1rem; border: 1px solid #0066cc; color: #0066cc; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 0.875rem;">EN</a>
    <a href="./README.zh.md" style="padding: 0.5rem 1rem; background-color: #0066cc; color: white; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 0.875rem;">中文</a>
  </div>
</div>

一个现代且功能丰富的博客平台，基于 Astro 构建，为技术内容创作者设计。

**网站**: [https://blog.lama.icu](https://blog.lama.icu)

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

## 功能特性

### 🚀 核心平台
- **基于 Astro**: 快速的静态网站生成，JavaScript 代码量最少
- **Markdown/MDX 支持**: 使用 Markdown 或 MDX 编写内容。
- **响应式设计**: 简洁的双栏布局，人体工学级优化阅读体验
- **构建集成**: CI/CD 感知的构建信息跟踪（提交哈希、分支、构建号）

### 📝 内容功能
- **内容集合**: 为页面和博客文章提供有组织的系统
- **元数据系统**: 支持发布日期、更新日期和自定义属性
- **Typst 数学支持**: 通过自定义 remark 插件使用 Typst 符号编写数学公式。No More LaTeX
- **自定义 Markdown 转换**:
  - 带视觉下划线的样式化一级标题
  - 带项目符号和编号的格式化列表
  - 行内代码高亮
  - 增强的段落样式

### 💻 代码增强
- **Expressive Code 集成**: 专业的代码块渲染，包含：
  - 语法高亮（Houston 主题）
  - 长代码可折叠区段
  - 行号（可选）
  - 语言徽章
  - 复制到剪贴板按钮
  - 特定语言自定义

### 🎨 样式与 UI
- **Tailwind CSS**: 功能优先的 CSS 框架，快速样式编写
- **排版插件**: 专业的内容排版样式
- **深色主题**: Houston 主题的深色模式，优化可读性
- **自定义样式**: 独立元素转换以实现一致的 Markdown 渲染
- **社交链接**: 集成的社交媒体链接（GitHub、邮箱、Telegram）

### 🔍 SEO 与发现
- **RSS 源**: 自动生成 RSS 源供博客订阅
- **网站地图**: 自动生成 XML 网站地图供搜索引擎索引
- **元标签**: 正确配置的网页标题和描述

### 🛡️ 用户体验
- **ES2025 浏览器检测**: 现代浏览器要求强制执行
- **可访问性警告**: 为不支持的浏览器提供清晰的提示
- **神秘10492**: 喜欢 noscript? 没有问题，给你看最老最热的 `av10492`
    - 注：原视频不会上传到 GitHub 防止号没了

## 快速开始

### 前置要求
- Node.js 22.12.0 或更高版本
- pnpm 包管理器

### 安装
```bash
pnpm install
```

### 开发
```bash
pnpm run dev
```
在 `http://localhost:4321` 启动开发服务器

### 构建
```bash
pnpm run build
```
在 `dist/` 目录中创建优化后的生产版本

## 项目结构

```
src/
├── components/        # 可复用的 Astro 组件
│   ├── BaseHead.astro        # HTML head 配置
│   ├── Header.astro          # 导航头部
│   ├── Footer.astro          # 网站底部
│   ├── RightBar.astro        # 滑块边栏，包含站点信息和社交链接
│   ├── BodyBox.astro         # 主内容包装器
│   └── Page.astro            # 页面布局组件
├── pages/            # 路由页面
│   ├── index.astro           # 首页
│   ├── about.astro           # 关于页面
│   ├── blog/
│   │   ├── index.astro       # 博客列表
│   │   └── [...slug].astro   # 博客文章详情页
│   └── rss.xml.js            # RSS 源
├── content/
│   └── pages/        # Markdown 内容文件
├── markdown/         # Markdown 处理工具函数
│   ├── transform.ts          # 自定义元素转换
│   ├── typst.ts              # Typst 数学支持
│   └── helper.ts             # 辅助函数
├── layouts/          # 布局组件
├── styles/           # 全局 CSS 和工具
│   ├── global.css            # 基础样式
│   └── md.css                # Markdown 特定样式
└── consts.ts         # 全站常量和构建信息
```

## 配置

如果你想用我的博客的template，请直接根据下面的配置项进行修改，大部分配色可以通过 `src/styles` 下的文件控制，少部分不可以，请翻阅源码，未来将优化这点。

### 网站常量 (`src/consts.ts`)
- `SITE_TITLE`: 博客名称
- `SITE_DESCRIPTION`: 网站标语
- `COPYRIGHT`: 版权声明
- 社交媒体链接: `GITHUB`, `EMAIL`, `TG`
- 从 `build.json` 加载的构建信息（`CI` 专用，请查看附带的 `build.example.json`）

## 内容指南

### 创建页面
1. 在 `src/content/pages/` 中创建 `.md` 或 `.mdx` 文件
2. 包含前置内容：
   ```yaml
   ---
   title: 页面标题
   pubDate: 2026-03-28
   updatedDate: 2026-03-28
   attribute: []  # 用于特殊页面路由
   ---
   ```

### 编写博客文章
- 使用标准 Markdown/MDX 语法
- 使用 Typst 符号的数学表达式
- 代码块（带语法高亮）
- 标题、列表和行内代码的自动转换
- 查看来自上游 Astro 自带的 `src/content/markdown-style-guide.md` 来学习具体写法

### 特殊页面路由

博客主页和关于页都通过 `src/content` 下的 Markdown 文件渲染，你需要在 `attribute` 中添加 `index` 或者 `about` 来渲染对应的界面。

## 待办事项

- [ ] Table CSS
- [ ] Bug fix
- [ ] OG support
- [ ] De-Tailwindcss-ify (no need at all...)

## 开源协议

本项目采用 **Anti-996** 协议。

选择此协议的初衷，是为了使大众不要忘记：时至今日，辛苦工作的程序员（以及其他行业的劳动者）们仍在遭受资本家的压迫却无处伸冤。

您**无需**严格遵循协议的全部法律条款，但**鼓励**您在引用或分发本项目时，附上作者名称 (**lamadaemon**) 以及 [996.icu](https://996.icu) 的链接，以声援劳动者权益。

> 本 README 文档基于项目目录内所有文件由 **Claude Haiku 4.5** 生成。内容已由作者 **lamadaemon** 人工审查并确认，作者对文档内容的准确性负责。此外，**本项目的所有源代码包括行内文档均不包含任何 AI 生成的内容**。
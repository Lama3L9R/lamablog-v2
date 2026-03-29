<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
  <h1 style="margin: 0;">Kūkan</h1>
  <div style="display: flex; gap: 0.5rem;">
    <a href="./README.md" style="padding: 0.5rem 1rem; background-color: #0066cc; color: white; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 0.875rem;">EN</a>
    <a href="./README.zh.md" style="padding: 0.5rem 1rem; border: 1px solid #0066cc; color: #0066cc; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 0.875rem;">中文</a>
  </div>
</div>

A modern, feature-rich blog platform built with Astro, designed for technical content creators.

**Site**: [https://blog.lama.icu](https://blog.lama.icu)

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

## Features

### 🚀 Core Platform
- **Astro-based**: Fast, static site generation with minimal JavaScript
- **Markdown/MDX Support**: Write content in Markdown or MDX with full React component support
- **Responsive Design**: Clean two-column layout with ergonomic-grade reading optimization
- **Build Integration**: CI/CD-aware build info tracking (commit hash, branch, build number)

### 📝 Content Features
- **Content Collections**: Organized system for pages and blog posts
- **Metadata System**: Support for publication dates, update dates, and custom attributes
- **Typst Math Support**: Write mathematical formulas using Typst notation via custom remark plugin. No More LaTeX
- **Custom Markdown Transformations**:
  - Styled headings with visual underlines for H1
  - Formatted lists with bullets and numbering
  - Inline code highlighting
  - Enhanced paragraph styling

### 💻 Code Enhancement
- **Expressive Code Integration**: Professional code block rendering with:
  - Syntax highlighting (Houston theme)
  - Collapsible sections for long code
  - Line numbers (optional)
  - Language badges
  - Copy-to-clipboard button
  - Language-specific customization

### 🎨 Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Typography Plugin**: Professional typography styles for content
- **Dark Theme**: Houston-themed dark mode optimized for readability
- **Custom Styling**: Per-element transformations for consistent markdown rendering
- **Social Links**: Integrated social media connections (GitHub, Email, Telegram)

### 🔍 SEO & Discovery
- **RSS Feed**: Automated RSS feed generation for blog subscriptions
- **Sitemap**: Automatic XML sitemap for search engine indexing
- **Meta Tags**: Proper head configuration with site title and description

### 🛡️ User Experience
- **ES2025 Browser Detection**: Modern browser requirement enforcement
- **Accessibility Warnings**: Clear messaging for unsupported browsers
- **Secret Feature**: Love noscript? No problem, lets watch `av10492`
    - Note: Original video not uploaded to GitHub to prevent getting banned

## Getting Started

### Prerequisites
- Node.js 22.12.0 or higher
- pnpm package manager

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm run dev
```
Starts the dev server at `http://localhost:4321`

### Build
```bash
pnpm run build
```
Creates optimized production build in the `dist/` directory

## Project Structure

```
src/
├── components/        # Reusable Astro components
│   ├── BaseHead.astro        # HTML head configuration
│   ├── Header.astro          # Navigation header
│   ├── Footer.astro          # Site footer
│   ├── RightBar.astro        # Sidebar with site info and social links
│   ├── BodyBox.astro         # Main content wrapper
│   └── Page.astro            # Page layout component
├── pages/            # Route pages
│   ├── index.astro           # Home page
│   ├── about.astro           # About page
│   ├── blog/
│   │   ├── index.astro       # Blog listing
│   │   └── [...slug].astro   # Blog post detail pages
│   └── rss.xml.js            # RSS feed
├── content/
│   └── pages/        # Markdown content files
├── markdown/         # Markdown processing utilities
│   ├── transform.ts          # Custom element transformations
│   ├── typst.ts              # Typst math support
│   └── helper.ts             # Helper functions
├── layouts/          # Layout components
├── styles/           # Global CSS and utilities
│   ├── global.css            # Base styles
│   └── md.css                # Markdown-specific styles
└── consts.ts         # Site-wide constants and build info
```

## Configuration

If you want to use my blog template, please modify based on the following configuration items. Most colors can be controlled through files under `src/styles`, while some cannot. Please review the source code. This will be optimized in the future.

### Site Constants (`src/consts.ts`)
- `SITE_TITLE`: Blog name
- `SITE_DESCRIPTION`: Site tagline
- `COPYRIGHT`: Copyright notice
- Social media links: `GITHUB`, `EMAIL`, `TG`
- Build information loaded from `build.json` (CI-only, see `build.example.json`)

## Content Guidelines

### Creating Pages
1. Create `.md` or `.mdx` files in `src/content/pages/`
2. Include frontmatter:
   ```yaml
   ---
   title: Page Title
   pubDate: 2026-03-28
   updatedDate: 2026-03-28
   attribute: []  # for special page routing
   ---
   ```

### Writing Blog Posts
- Uses standard Markdown/MDX syntax
- Math expressions with Typst notation
- Code blocks with syntax highlighting
- Automatic transformations for headings, lists, and inline code
- See the upstream Astro bundled `src/content/markdown-style-guide.md` to learn specific syntax

### Special Page Routes

Blog homepage and about page are both rendered through Markdown files under `src/content`. You need to add `index` or `about` in the `attribute` field to render the corresponding page.

## TODO

- [ ] Table CSS
- [ ] Bug fix
- [ ] OG support
- [ ] De-Tailwindcss-ify (no need at all...)

## License

This project is licensed under the **Anti-996** License.

The purpose of choosing this license is to ensure the public **does not forget**: even today, hardworking programmers (and laborers in other industries) are still suffering from oppression by capitalists with nowhere to turn for justice.

You are **not required** to strictly follow all legal terms of the license, but you are **encouraged** to include the author's name (**lamadaemon**) and a link to [996.icu](https://996.icu) when referencing or distributing this project, to voice support for labor rights.

> This README documentation was generated by **Claude Haiku 4.5** based on all files in the project directory. The content has been reviewed and verified by the author **lamadaemon**, who is responsible for the accuracy of the documentation. Additionally, **all source code in this project, including inline documentation, does not contain any AI-generated content**.

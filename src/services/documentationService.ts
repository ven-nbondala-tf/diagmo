/**
 * Documentation Service
 * Generates interactive documentation from diagrams
 */

import { nanoid } from 'nanoid'
import type { DiagramNode, DiagramEdge } from '@/types'

// Documentation section representing a view of the diagram
export interface DocumentationSection {
  id: string
  title: string
  description: string // Markdown content
  viewport: {
    x: number
    y: number
    zoom: number
  }
  highlightedNodes: string[]
  codeSnippets?: Array<{
    language: string
    code: string
    title?: string
  }>
  order: number
}

// Full documentation configuration
export interface DocumentationConfig {
  id: string
  title: string
  subtitle?: string
  author?: string
  version?: string
  createdAt: Date
  updatedAt: Date
  sections: DocumentationSection[]
  theme: 'light' | 'dark' | 'auto'
  navigation: 'sidebar' | 'arrows' | 'scroll'
  showTableOfContents: boolean
  diagramId: string
}

// Export options
export interface ExportOptions {
  format: 'html' | 'markdown' | 'gitbook'
  includeInteractive: boolean
  embedDiagram: boolean
  customCss?: string
}

// Create a new documentation config
export function createDocumentation(
  diagramId: string,
  title: string
): DocumentationConfig {
  return {
    id: nanoid(),
    title,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [],
    theme: 'auto',
    navigation: 'sidebar',
    showTableOfContents: true,
    diagramId,
  }
}

// Create a new section from current view
export function createSection(
  title: string,
  viewport: { x: number; y: number; zoom: number },
  highlightedNodes: string[] = [],
  existingSections: DocumentationSection[] = []
): DocumentationSection {
  return {
    id: nanoid(),
    title,
    description: '',
    viewport,
    highlightedNodes,
    codeSnippets: [],
    order: existingSections.length,
  }
}

// Generate HTML documentation
export function generateHtmlDocumentation(
  config: DocumentationConfig,
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  options: ExportOptions
): string {
  const themeClass = config.theme === 'dark' ? 'dark' : ''
  const embedUrl = `${window.location.origin}/embed/${config.diagramId}`

  const sectionsHtml = config.sections
    .sort((a, b) => a.order - b.order)
    .map(section => generateSectionHtml(section, embedUrl, options))
    .join('\n')

  const tocHtml = config.showTableOfContents
    ? `<nav class="doc-toc">
        <h2>Table of Contents</h2>
        <ul>
          ${config.sections
            .sort((a, b) => a.order - b.order)
            .map(s => `<li><a href="#section-${s.id}">${escapeHtml(s.title)}</a></li>`)
            .join('\n')}
        </ul>
      </nav>`
    : ''

  return `<!DOCTYPE html>
<html lang="en" class="${themeClass}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(config.title)}</title>
  <style>
    ${getDocumentationStyles(config.theme)}
    ${options.customCss || ''}
  </style>
</head>
<body>
  <div class="doc-container">
    <header class="doc-header">
      <h1>${escapeHtml(config.title)}</h1>
      ${config.subtitle ? `<p class="subtitle">${escapeHtml(config.subtitle)}</p>` : ''}
      ${config.author ? `<p class="author">By ${escapeHtml(config.author)}</p>` : ''}
      ${config.version ? `<p class="version">Version ${escapeHtml(config.version)}</p>` : ''}
    </header>

    ${tocHtml}

    <main class="doc-content">
      ${sectionsHtml}
    </main>

    <footer class="doc-footer">
      <p>Generated with <a href="https://diagmo.io" target="_blank">Diagmo</a></p>
      <p>Last updated: ${config.updatedAt.toLocaleDateString()}</p>
    </footer>
  </div>

  ${options.includeInteractive ? getInteractiveScript() : ''}
</body>
</html>`
}

// Generate HTML for a single section
function generateSectionHtml(
  section: DocumentationSection,
  embedUrl: string,
  options: ExportOptions
): string {
  const viewportParams = new URLSearchParams({
    x: String(section.viewport.x),
    y: String(section.viewport.y),
    zoom: String(section.viewport.zoom),
    highlight: section.highlightedNodes.join(','),
  })

  const diagramHtml = options.embedDiagram
    ? `<div class="diagram-viewport">
        <iframe
          src="${embedUrl}?${viewportParams}"
          width="100%"
          height="400"
          frameborder="0"
          loading="lazy"
        ></iframe>
      </div>`
    : ''

  const codeSnippetsHtml = section.codeSnippets?.length
    ? `<div class="code-snippets">
        ${section.codeSnippets.map(snippet => `
          <div class="code-snippet">
            ${snippet.title ? `<div class="code-title">${escapeHtml(snippet.title)}</div>` : ''}
            <pre><code class="language-${snippet.language}">${escapeHtml(snippet.code)}</code></pre>
          </div>
        `).join('\n')}
      </div>`
    : ''

  return `
    <section id="section-${section.id}" class="doc-section">
      <h2>${escapeHtml(section.title)}</h2>
      ${diagramHtml}
      <div class="section-description">
        ${parseMarkdown(section.description)}
      </div>
      ${codeSnippetsHtml}
    </section>
  `
}

// Generate Markdown documentation
export function generateMarkdownDocumentation(
  config: DocumentationConfig,
  options: ExportOptions
): string {
  const embedUrl = `${window.location.origin}/embed/${config.diagramId}`

  let md = `# ${config.title}\n\n`

  if (config.subtitle) {
    md += `*${config.subtitle}*\n\n`
  }

  if (config.author || config.version) {
    md += `---\n`
    if (config.author) md += `**Author:** ${config.author}\n`
    if (config.version) md += `**Version:** ${config.version}\n`
    md += `---\n\n`
  }

  // Table of Contents
  if (config.showTableOfContents) {
    md += `## Table of Contents\n\n`
    config.sections
      .sort((a, b) => a.order - b.order)
      .forEach((section, index) => {
        md += `${index + 1}. [${section.title}](#${slugify(section.title)})\n`
      })
    md += `\n`
  }

  // Sections
  config.sections
    .sort((a, b) => a.order - b.order)
    .forEach(section => {
      md += `## ${section.title}\n\n`

      if (options.embedDiagram) {
        const viewportParams = new URLSearchParams({
          x: String(section.viewport.x),
          y: String(section.viewport.y),
          zoom: String(section.viewport.zoom),
          highlight: section.highlightedNodes.join(','),
        })
        md += `![Diagram](${embedUrl}?${viewportParams})\n\n`
      }

      md += `${section.description}\n\n`

      if (section.codeSnippets?.length) {
        section.codeSnippets.forEach(snippet => {
          if (snippet.title) {
            md += `### ${snippet.title}\n\n`
          }
          md += `\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`\n\n`
        })
      }
    })

  md += `---\n\n*Generated with [Diagmo](https://diagmo.io)*\n`

  return md
}

// Generate GitBook compatible structure
export function generateGitBookDocumentation(
  config: DocumentationConfig,
  options: ExportOptions
): { files: Array<{ path: string; content: string }> } {
  const files: Array<{ path: string; content: string }> = []

  // README.md (main page)
  let readme = `# ${config.title}\n\n`
  if (config.subtitle) readme += `${config.subtitle}\n\n`
  if (config.author) readme += `Author: ${config.author}\n\n`
  files.push({ path: 'README.md', content: readme })

  // SUMMARY.md (table of contents)
  let summary = `# Summary\n\n`
  summary += `* [Introduction](README.md)\n`
  config.sections
    .sort((a, b) => a.order - b.order)
    .forEach(section => {
      const filename = slugify(section.title) + '.md'
      summary += `* [${section.title}](${filename})\n`
    })
  files.push({ path: 'SUMMARY.md', content: summary })

  // Individual section files
  config.sections
    .sort((a, b) => a.order - b.order)
    .forEach(section => {
      const filename = slugify(section.title) + '.md'
      let content = `# ${section.title}\n\n`

      if (options.embedDiagram) {
        const embedUrl = `${window.location.origin}/embed/${config.diagramId}`
        const viewportParams = new URLSearchParams({
          x: String(section.viewport.x),
          y: String(section.viewport.y),
          zoom: String(section.viewport.zoom),
          highlight: section.highlightedNodes.join(','),
        })
        content += `{% embed url="${embedUrl}?${viewportParams}" %}\n\n`
      }

      content += `${section.description}\n\n`

      if (section.codeSnippets?.length) {
        section.codeSnippets.forEach(snippet => {
          if (snippet.title) content += `## ${snippet.title}\n\n`
          content += `\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`\n\n`
        })
      }

      files.push({ path: filename, content })
    })

  return { files }
}

// Simple markdown parser (basic support)
function parseMarkdown(md: string): string {
  if (!md) return ''

  return md
    // Headers
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n/gim, '<br>')
    // Lists
    .replace(/^\s*[-*]\s+(.+)$/gim, '<li>$1</li>')
}

// CSS styles for documentation
function getDocumentationStyles(theme: 'light' | 'dark' | 'auto'): string {
  return `
    :root {
      --doc-bg: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
      --doc-text: ${theme === 'dark' ? '#e5e5e5' : '#333333'};
      --doc-heading: ${theme === 'dark' ? '#ffffff' : '#111111'};
      --doc-link: #3b82f6;
      --doc-border: ${theme === 'dark' ? '#333333' : '#e5e7eb'};
      --doc-code-bg: ${theme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--doc-bg);
      color: var(--doc-text);
      line-height: 1.6;
    }

    .doc-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .doc-header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--doc-border);
    }

    .doc-header h1 {
      font-size: 2.5rem;
      color: var(--doc-heading);
      margin-bottom: 0.5rem;
    }

    .doc-header .subtitle {
      font-size: 1.25rem;
      color: var(--doc-text);
      opacity: 0.8;
    }

    .doc-toc {
      margin-bottom: 3rem;
      padding: 1.5rem;
      background: var(--doc-code-bg);
      border-radius: 8px;
    }

    .doc-toc h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .doc-toc ul {
      list-style: none;
    }

    .doc-toc li {
      margin-bottom: 0.5rem;
    }

    .doc-toc a {
      color: var(--doc-link);
      text-decoration: none;
    }

    .doc-toc a:hover {
      text-decoration: underline;
    }

    .doc-section {
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--doc-border);
    }

    .doc-section h2 {
      font-size: 1.75rem;
      color: var(--doc-heading);
      margin-bottom: 1rem;
    }

    .diagram-viewport {
      margin: 1.5rem 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--doc-border);
    }

    .diagram-viewport iframe {
      display: block;
    }

    .section-description {
      margin: 1.5rem 0;
    }

    .section-description code {
      background: var(--doc-code-bg);
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .code-snippets {
      margin-top: 1.5rem;
    }

    .code-snippet {
      margin-bottom: 1rem;
    }

    .code-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .code-snippet pre {
      background: var(--doc-code-bg);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }

    .code-snippet code {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.9rem;
    }

    .doc-footer {
      text-align: center;
      padding-top: 2rem;
      color: var(--doc-text);
      opacity: 0.6;
      font-size: 0.875rem;
    }

    .doc-footer a {
      color: var(--doc-link);
    }

    @media (max-width: 768px) {
      .doc-container {
        padding: 1rem;
      }

      .doc-header h1 {
        font-size: 1.75rem;
      }
    }
  `
}

// Interactive JavaScript for the documentation
function getInteractiveScript(): string {
  return `
    <script>
      // Smooth scrolling for TOC links
      document.querySelectorAll('.doc-toc a').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          const target = document.querySelector(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      // Highlight current section in TOC
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            document.querySelectorAll('.doc-toc a').forEach(a => {
              a.classList.toggle('active', a.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('.doc-section').forEach(section => {
        observer.observe(section);
      });
    </script>
  `
}

// Utility functions
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const documentationService = {
  createDocumentation,
  createSection,
  generateHtmlDocumentation,
  generateMarkdownDocumentation,
  generateGitBookDocumentation,
}

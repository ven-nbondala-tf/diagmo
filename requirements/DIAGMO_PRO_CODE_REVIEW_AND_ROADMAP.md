# Diagmo Pro — Code Review & Feature Roadmap

> **Reviewer:** Claude · **Date:** February 4, 2026  
> **Codebase:** React + TypeScript + @xyflow/react + Zustand + Supabase + Tailwind CSS + shadcn/ui

---

## Part 1 — Honest Code Review

### What's Working Well

The project has a solid architectural foundation. You've made smart technology choices — @xyflow/react is the right library for this, Zustand keeps state management lightweight, TanStack Query handles server state cleanly, and shadcn/ui gives you accessible components out of the box. The separation between services, hooks, stores, and components shows good intent. Template gallery, web image search, cloud provider icons (AWS/Azure/GCP), folder management, and auto-save are all genuinely useful features that differentiate this from a toy project.

That said, there are real problems across architecture, performance, code quality, and UX that need attention before this can scale.

---

### 🔴 Critical Issues

#### 1. PropertiesPanel.tsx is 1,548 lines — a maintenance nightmare

This single component handles node styling, edge styling, image properties, text formatting, shadow controls, size/position editing, arrange/z-index controls, and more. It contains inline `useEditorStore.setState()` calls, local sub-components (`SliderWithInput`, `IconButton`, `ColorPicker`), and duplicated logic. Any bug fix here is a high-risk change.

**What to do:** Break this into `NodeProperties`, `EdgeProperties`, `FillSection`, `BorderSection`, `TextSection`, `ShadowSection`, `ArrangeSection`, and `SizeSection` as separate files. Extract `SliderWithInput`, `IconButton`, and `ColorPicker` into `components/ui/`.

#### 2. CustomNode.tsx is 1,330 lines with a monolithic switch statement

Every single shape type (rectangle, diamond, UML class, cloud, callout, star, etc.) is rendered inside one giant `switch` block in a single component. Adding a new shape means editing this massive file and risking regressions in every other shape.

**What to do:** Create a shape registry pattern:

```typescript
// shapes/registry.ts
const shapeRenderers: Record<ShapeType, React.FC<ShapeRenderProps>> = {
  rectangle: RectangleShape,
  diamond: DiamondShape,
  'uml-class': UMLClassShape,
  // ...
}
```

Each shape becomes its own file. CustomNode just looks up and renders the right one.

#### 3. Duplicate keyboard shortcut handlers

Both `DiagramEditor.tsx` and `EditorHeader.tsx` register their own `keydown` listeners for undo/redo/copy/paste. This means every keystroke is processed twice and race conditions are possible. There's no centralized command system.

**What to do:** Create a single `useKeyboardShortcuts` hook or a `CommandManager` that registers all shortcuts in one place. Both components should use that instead of adding their own listeners.

#### 4. History management pushes on every position change

In `onNodesChange`, any `position` change calls `pushHistory()`. This means dragging a node creates potentially hundreds of history entries (one per mouse-move frame). Your undo stack fills up with near-identical states, and undo becomes useless because you have to click it 50 times to reverse a single drag.

**What to do:** Debounce history pushes, or only push on `dragEnd` (when `change.dragging === false` after a `position` change). Something like:

```typescript
const hasPositionEnd = changes.some(
  c => c.type === 'position' && 'dragging' in c && c.dragging === false
)
if (hasPositionEnd) get().pushHistory()
```

#### 5. Direct `useEditorStore.setState()` calls scattered in JSX

The PropertiesPanel directly calls `useEditorStore.setState()` in onChange handlers for position, width, height, and z-index changes — bypassing the store's defined actions. This breaks the action/update contract, skips history tracking, and makes it impossible to add middleware or logging later.

**What to do:** Add proper store actions: `updateNodePosition`, `updateNodeDimensions`, `bringToFront`, `sendToBack`, `bringForward`, `sendBackward`. Use those in the UI.

---

### 🟡 Significant Issues

#### 6. No error boundaries anywhere

If any component throws (a corrupt node, a bad SVG path, a missing image URL), the entire app crashes with a white screen. There's no recovery.

**What to do:** Add `<ErrorBoundary>` wrappers around the editor, each node renderer, the properties panel, and the dashboard. At minimum, use `react-error-boundary` around `<ReactFlow>` and `<PropertiesPanel>`.

#### 7. ShapeType union is 250+ string literals in types/index.ts

Every AWS, Azure, GCP, Office, and Generic icon is a string literal in a single union type. This is technically fine for TypeScript but creates maintenance burden and makes it easy to add a type in the union but forget to add it to constants, shape previews, or default dimensions.

**What to do:** Consider a shape registry where each shape self-registers its type, label, preview, default dimensions, and renderer. Or at least add runtime validation that all entries in the type union have corresponding entries in `SHAPE_LABELS`, `SHAPE_CATEGORIES`, and the renderer.

#### 8. Auto-save fires on a timer, not on actual changes

The auto-save interval runs regardless and checks `isDirty` on each tick. This is fine for small diagrams but will become problematic with large diagrams that save frequently. There's also no conflict detection — if two tabs are open on the same diagram, they'll overwrite each other silently.

**What to do:** Debounce saves to fire N seconds after the last change, not on a fixed interval. Add `updatedAt` comparison before saving to detect conflicts. Consider optimistic concurrency control.

#### 9. Export service uses `html-to-image` on the viewport element

This captures whatever is currently visible on screen, including the background grid, minimap edges, and any partially-visible nodes. If the user is zoomed in, only that portion exports. This is not what users expect — they want the full diagram.

**What to do:** Use React Flow's built-in `getNodesBounds` and `getViewportForBounds` to calculate the full diagram extent, then render it off-screen at the correct dimensions before exporting. React Flow has a `toObject()` helper and the `@xyflow/react` docs have an export recipe using this approach.

#### 10. No loading/optimistic states on mutations

`useCreateDiagram`, `useDeleteDiagram`, and `useUpdateDiagram` don't use TanStack Query's `onMutate` for optimistic updates. Deleting a diagram shows no visual feedback until the server responds. Same for creating one.

**What to do:** Add `onMutate` handlers with optimistic cache updates and `onError` rollbacks. Show toast + skeleton during creation. Immediately remove the card on delete with a rollback if it fails.

#### 11. Context menu is disabled due to a bug

There's a comment in CustomNode.tsx: `// Context menu temporarily disabled due to React ref loop issue`. This means right-click functionality (duplicate, delete, lock, copy, paste, bring to front/back) is completely missing from the canvas — a major UX gap for a diagramming tool.

**What to do:** Fix the ref forwarding issue (likely a Radix UI `forwardRef` conflict with React Flow's node wrapper), or switch to a simpler context menu implementation that doesn't rely on Radix portals within the flow container.

---

### 🟢 Minor / Style Issues

| Issue | Location | Fix |
|---|---|---|
| `SliderWithInput` does a side-effect state update during render (`if (parseFloat(inputValue) !== value ...`) | PropertiesPanel.tsx:93 | Move to `useEffect` |
| `getDefaultLabel` and `getDefaultDimensions` are defined outside the store but coupled to it | editorStore.ts:681-730 | Move to a `shapeDefaults.ts` utility |
| Auth store uses `persist` middleware but partializes to nothing | authStore.ts:152 | Remove persist middleware entirely — it's doing nothing |
| `mapDiagramFromDB` does manual field mapping | diagramService.ts:21-34 | Use a proper ORM mapper or Supabase's `select` with aliases |
| Color picker presets are hardcoded in PropertiesPanel | PropertiesPanel.tsx:160 | Move to constants and allow user-saved recent colors |
| `cn` utility is in its own folder with a test | utils/cn.ts | Fine, but the test is trivial — test more meaningful logic |
| No TypeScript `strict: true` visible | Project config | Enable `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns` |
| Edge label input width is calculated with magic number `labelText.length * 8 + 16` | LabeledEdge.tsx:329 | Use a hidden measurement element or `canvas.measureText()` |

---

## Part 2 — UX Improvements

### Current UX Pain Points

1. **No onboarding or empty state guidance** — New users land on a blank dashboard with zero guidance
2. **Shape panel search is text-only** — No visual browsing by category is the default
3. **Properties panel defaults to all collapsed** — Users have to click to open every section
4. **No contextual toolbar** — When you select a node, you should get a floating mini-toolbar (like Figma/Miro)
5. **No cursor mode toggle** — No way to switch between Select, Pan, and Connect modes explicitly
6. **No undo/redo visual feedback** — No toast or state indicator when undo/redo is used
7. **Diagram name is a tiny input** — Easy to miss that it's editable
8. **No collaborative presence indicators** — Single-player only
9. **No zoom-to-fit on diagram open** — `fitView` is set but may not account for large diagrams well
10. **No drag-to-select visual** — Selection box isn't styled distinctly

### Recommended UX Improvements

#### Quick Wins (< 1 day each)

- **Smart context auto-expand in Properties Panel** — Auto-expand "Fill" and "Text" when a node is selected, "Line Style" when an edge is selected
- **Floating selection toolbar** — When 1+ nodes are selected, show a compact toolbar directly above/below the selection with: delete, duplicate, lock, color, align (replaces the static top-center toolbar)
- **Cursor mode indicator** — Add Select / Pan / Connect mode icons to the bottom-left near zoom controls
- **Better empty dashboard** — Show 3-4 template thumbnails inline instead of just a "Create" button
- **Double-click canvas to add a shape** — Show a quick-add radial menu or text node by default
- **Toast on undo/redo** — Brief "Undone" / "Redone" toast so users know it worked

#### Medium Effort (1-3 days each)

- **Quick-shape toolbar** — Persistent bottom toolbar with the 6 most-used shapes (rectangle, diamond, circle, text, arrow, note) for one-click add
- **Smart connectors** — When hovering near a handle, show a ghost preview of where the connection will go
- **Shape style presets / themes** — Pre-defined style sets (Blueprint, Pastel, Corporate, Neon) that apply colors across all shapes
- **Minimap click-to-navigate** — Click on minimap to jump to that area
- **Recent colors** — Track last 8 colors used and show them in the picker
- **Multi-select properties** — When multiple nodes are selected, show shared properties and allow batch editing (partially implemented but could be smoother)

---

## Part 3 — New Feature Roadmap

Organized by priority and grouped into implementable phases.

### Phase 1: Core Polish (Weeks 1-2)

These fix gaps that make the tool feel incomplete.

| Feature | Description | Complexity |
|---|---|---|
| **Fix context menu** | Re-enable right-click context menu on nodes and canvas | Medium |
| **Command palette** | `Cmd+K` opens a searchable command palette (Figma-style) for any action | Medium |
| **JSON import** | Import diagrams from exported JSON files | Low |
| **PDF export** | Fix PDF export to render full diagram (not just viewport) | Medium |
| **Diagram thumbnails** | Auto-generate thumbnail on save for dashboard cards | Medium |
| **Connectable edges to edges** | Allow edges to branch from midpoints of other edges | High |

### Phase 2: Real-Time Collaboration (Weeks 3-5)

The single most impactful feature for a diagramming tool.

| Feature | Description | Complexity |
|---|---|---|
| **Supabase Realtime** | Use Supabase Realtime's Broadcast/Presence for multiplayer editing | High |
| **Cursor presence** | Show other users' cursors + names on the canvas in real-time | Medium |
| **Selection awareness** | Highlight which nodes other users have selected (colored outlines) | Medium |
| **Conflict resolution** | Last-write-wins with visual merge indicators for simultaneous edits | High |
| **Share dialog** | Share a diagram via link with view/edit/comment permissions | Medium |
| **Comments** | Click anywhere on canvas to leave a comment thread (Figma-style) | High |

### Phase 3: AI-Powered Features (Weeks 6-8)

Use LLMs to differentiate from Lucidchart/Draw.io.

| Feature | Description | Complexity |
|---|---|---|
| **AI diagram generation** | "Draw a microservices architecture for an e-commerce app" → generates nodes + edges | High |
| **AI auto-layout** | Select nodes → "Auto-arrange" using AI to determine optimal layout (dagre/ELK) | Medium |
| **AI style suggestions** | AI analyzes your diagram and suggests color/layout improvements | Medium |
| **Natural language to diagram** | Paste a paragraph → AI extracts entities and relationships into a diagram | High |
| **AI explain diagram** | Select a diagram → AI generates a written explanation of the architecture | Medium |
| **Smart templates** | Describe what you need → AI picks and customizes the best template | Medium |

### Phase 4: Advanced Diagramming (Weeks 9-12)

Professional features that compete with Lucidchart/Visio.

| Feature | Description | Complexity |
|---|---|---|
| **Swimlanes / containers** | Drag-to-create lane containers that auto-hold nodes dropped inside | High |
| **Layers panel** | Toggle visibility/lockability of named layers | Medium |
| **Custom shape builder** | Draw custom shapes with a pen tool or upload SVG | High |
| **Linked data** | Attach key-value metadata to nodes (e.g., cost, owner, status) | Medium |
| **Conditional formatting** | Color nodes based on data values (e.g., red if cost > $1000) | Medium |
| **Version history** | Visual timeline of diagram changes with preview and restore | High |
| **Presentation mode** | Step through the diagram in a slide-like presentation (highlight sections sequentially) | Medium |
| **Embed mode** | Generate an `<iframe>` embed code for docs/wikis | Low |

### Phase 5: Ecosystem & Integrations (Weeks 13-16)

| Feature | Description | Complexity |
|---|---|---|
| **Mermaid import/export** | Paste Mermaid syntax → auto-generate diagram (and vice versa) | Medium |
| **Draw.io / Lucidchart import** | Parse `.drawio` XML or Lucidchart JSON into Diagmo nodes/edges | High |
| **GitHub integration** | Save diagrams as code in a repo; embed in READMEs | Medium |
| **Confluence / Notion embed** | Publish diagrams as live embeds in team wikis | Medium |
| **API for programmatic diagrams** | REST API to create/update diagrams from CI/CD pipelines or scripts | High |
| **Terraform / CloudFormation visualizer** | Upload IaC files → auto-generate architecture diagram with correct AWS/Azure/GCP icons | High |

---

## Part 4 — UI Modernization Guide

### Current State

The UI uses shadcn/ui defaults with minimal customization. It looks clean but generic — indistinguishable from any shadcn starter project. The editor layout (left panel + canvas + right panel) is correct but the panels feel static and utilitarian.

### Modernization Targets

#### 1. Design System Polish

- **Add a custom color palette** beyond the default shadcn neutral grays. Use a signature brand color (e.g., indigo-500 `#6366f1`) for primary actions, handles, selection states. Keep the canvas neutral.
- **Typography upgrade** — Use Inter for UI chrome but add JetBrains Mono or Fira Code for shape labels (optional), and a display weight (Inter 700/800) for dashboard headings.
- **Consistent spacing scale** — Audit all `p-3`, `p-4`, `gap-2`, `gap-3` usage. Pick a 4px base grid and stick to it: 4, 8, 12, 16, 24, 32, 48.
- **Micro-interactions** — Add subtle transitions: panel open/close with `framer-motion`, button hover scales, toolbar appear/disappear animations. Currently everything is instant/binary.

#### 2. Canvas Modernization

- **Glass-morphism floating panels** — The toolbar, zoom controls, and minimap should feel like floating glass cards over the canvas, not rigid docked elements. Use `backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-lg ring-1 ring-black/5`.
- **Refined grid** — Replace dots with a subtle cross-hatch or line grid with very low opacity. Add a secondary major grid every 5 cells.
- **Selection box styling** — Blue translucent fill with a dashed border during drag-select.
- **Node shadows on hover** — Add `box-shadow: 0 8px 25px -5px rgba(0,0,0,0.1)` on hover for a "lift" effect.

#### 3. Panel Redesign

- **Collapsible left panel** — Add a toggle button to collapse the shape panel to just icons (like VS Code's sidebar). Saves 200px of screen space.
- **Tabbed right panel** — Instead of one long scrollable properties panel, use tabs: "Style" | "Text" | "Arrange" | "Data". Each tab shows only relevant controls.
- **Floating color picker** — Replace the inline color picker with a popover that includes: recent colors, preset palettes, hex input, and an eyedropper tool.
- **Properties panel: show context-specific sections only** — If a text node is selected, don't show border/fill. If an edge is selected, don't show shadow/rotation.

#### 4. Dashboard Redesign

- **Card hover effects** — On hover, scale the card slightly (1.02) and show a preview animation or highlight.
- **Grid/List toggle** — Let users switch between card grid and compact list view.
- **Sorting options** — Sort by name, last modified, created date.
- **Drag-and-drop folder management** — Drag diagram cards into folders in the sidebar.
- **Activity timestamps** — Show "Edited 2 hours ago" instead of raw dates.

---

## Part 5 — Technical Debt Priorities

Listed in order of impact-per-effort:

1. **Split PropertiesPanel.tsx** into ~8 focused components (2-3 hours, eliminates the #1 maintenance risk)
2. **Fix history debouncing** (1 hour, makes undo/redo actually usable)
3. **Centralize keyboard shortcuts** into one hook (1-2 hours, eliminates duplicate listeners)
4. **Replace inline `setState` calls** with proper store actions (2 hours, restores the action contract)
5. **Add error boundaries** (1 hour, prevents full-app crashes)
6. **Fix export to capture full diagram** (2-3 hours, makes exports actually useful)
7. **Re-enable context menu** (2-4 hours, restores right-click UX)
8. **Create a shape registry** to break up CustomNode.tsx (4-6 hours, enables scalable shape adding)
9. **Add optimistic mutation updates** (2 hours, makes dashboard feel instant)
10. **Enable TypeScript strict mode** and fix resulting errors (2-4 hours, catches real bugs)

---

## Summary

Diagmo Pro has a genuinely solid foundation — the tech stack is modern and well-chosen, the feature set is ambitious (cloud icons, web images, templates, folders), and the core diagramming works. The biggest risks right now are the two mega-files (PropertiesPanel and CustomNode), the history system flooding, the duplicate keyboard handlers, and the disabled context menu.

If you tackle the technical debt priorities above first, you'll have a much cleaner base to build the feature roadmap on. The collaboration and AI features are the ones that will differentiate this tool in a crowded market — everything else is table stakes that Lucidchart and Draw.io already do well.

The code is honest, working software. These recommendations are about taking it from "works" to "scales and ships."

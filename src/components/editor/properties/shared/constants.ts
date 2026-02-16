export const STYLE_SECTIONS = ['image', 'fill', 'border', 'shadow']
export const TEXT_SECTIONS = ['text']
export const LAYOUT_SECTIONS = ['size', 'arrange', 'group']
export const DATA_SECTIONS = ['table-structure', 'table-appearance', 'table-banding', 'table-data', 'uml-class', 'database']
export const SHAPE_SECTIONS = [...STYLE_SECTIONS, ...TEXT_SECTIONS, ...LAYOUT_SECTIONS, ...DATA_SECTIONS]
export const EDGE_SECTIONS = ['routing', 'waypoints', 'line-style', 'arrows', 'line-label', 'animation']

export const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
]

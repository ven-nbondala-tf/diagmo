import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'
import type { TableData } from '@/types'
import { useEditorStore } from '@/stores/editorStore'
import { useThemeStore } from '@/stores/themeStore'
import { collaborationService } from '@/services/collaborationService'

const DEFAULT_TABLE_DATA: TableData = {
  rows: 3,
  cols: 3,
  cells: [
    ['Header 1', 'Header 2', 'Header 3'],
    ['Cell 1,1', 'Cell 1,2', 'Cell 1,3'],
    ['Cell 2,1', 'Cell 2,2', 'Cell 2,3'],
  ],
  headerRow: true,
  headerCol: false,
}

const DEFAULT_COLUMN_WIDTH = 100
const DEFAULT_ROW_HEIGHT = 32
const MIN_COLUMN_WIDTH = 40
const MIN_ROW_HEIGHT = 24

// Calculate luminance of a color to determine if it's light or dark
function getLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '')
  if (hex.length !== 6) return 0.5
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255

  const rLin = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gLin = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bLin = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

// Get contrasting text color based on background
function getContrastingTextColor(bgColor: string | undefined, themeTextColor: string, explicitTextColor?: string): string {
  if (explicitTextColor) return explicitTextColor
  if (!bgColor || bgColor === 'transparent') {
    return themeTextColor
  }

  try {
    const luminance = getLuminance(bgColor)
    return luminance > 0.5 ? '#1f2937' : '#f3f4f6'
  } catch {
    return themeTextColor
  }
}

function TableRenderer({ nodeId, data, style, baseStyle, locked, getDropShadowFilter }: ShapeRenderProps) {
  const tableData = data.tableData || DEFAULT_TABLE_DATA

  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [cellValue, setCellValue] = useState('')
  const [resizing, setResizing] = useState<{ type: 'col' | 'row'; index: number; startPos: number; startSize: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  const updateNode = useEditorStore((state) => state.updateNode)
  const updateNodeDimensions = useEditorStore((state) => state.updateNodeDimensions)
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)

  // Theme-aware default text color
  const themeTextColor = resolvedTheme === 'dark' ? '#ededed' : '#111827'

  // Column widths and row heights with defaults
  const columnWidths = tableData.columnWidths || Array(tableData.cols).fill(DEFAULT_COLUMN_WIDTH)
  const rowHeights = tableData.rowHeights || Array(tableData.rows).fill(DEFAULT_ROW_HEIGHT)

  // Table styling options with defaults
  const headerBgColor = tableData.headerBgColor || '#f3f4f6'
  const headerTextColor = tableData.headerTextColor || getContrastingTextColor(headerBgColor, themeTextColor)
  const bandColor = tableData.bandColor || '#f9fafb'
  const bandedRows = tableData.bandedRows || false
  const bandedCols = tableData.bandedCols || false

  // Calculate text color for regular cells based on background
  const cellBgColor = baseStyle.backgroundColor || '#ffffff'

  // Start editing a cell
  const startEditing = useCallback(
    (row: number, col: number) => {
      if (locked) return
      const currentValue = tableData.cells[row]?.[col] || ''
      setEditingCell({ row, col })
      setCellValue(currentValue)
    },
    [locked, tableData.cells]
  )

  // Save cell value
  const saveCell = useCallback(() => {
    if (!editingCell || !nodeId) return

    const { row, col } = editingCell
    const newCells = tableData.cells.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? cellValue : c))
    )

    const newTableData = {
      ...tableData,
      cells: newCells,
    }

    updateNode(nodeId, { tableData: newTableData })

    // Broadcast to collaborators
    if (collaborationService.isConnected()) {
      collaborationService.broadcastOperation('node-update', nodeId, {
        data: { tableData: newTableData }
      })
    }

    setEditingCell(null)
  }, [editingCell, nodeId, cellValue, tableData, updateNode])

  // Handle key navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!editingCell) return

      const { row, col } = editingCell

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        saveCell()
        if (row < tableData.rows - 1) {
          startEditing(row + 1, col)
        }
      } else if (e.key === 'Tab') {
        e.preventDefault()
        saveCell()
        if (e.shiftKey) {
          if (col > 0) {
            startEditing(row, col - 1)
          } else if (row > 0) {
            startEditing(row - 1, tableData.cols - 1)
          }
        } else {
          if (col < tableData.cols - 1) {
            startEditing(row, col + 1)
          } else if (row < tableData.rows - 1) {
            startEditing(row + 1, 0)
          }
        }
      } else if (e.key === 'Escape') {
        setEditingCell(null)
      }
    },
    [editingCell, saveCell, startEditing, tableData.rows, tableData.cols]
  )

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  // Handle column resize
  const handleColResizeStart = useCallback((e: React.MouseEvent, colIndex: number) => {
    if (locked) return
    e.stopPropagation()
    e.preventDefault()
    setResizing({
      type: 'col',
      index: colIndex,
      startPos: e.clientX,
      startSize: columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH,
    })
  }, [locked, columnWidths])

  // Handle row resize
  const handleRowResizeStart = useCallback((e: React.MouseEvent, rowIndex: number) => {
    if (locked) return
    e.stopPropagation()
    e.preventDefault()
    setResizing({
      type: 'row',
      index: rowIndex,
      startPos: e.clientY,
      startSize: rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT,
    })
  }, [locked, rowHeights])

  // Handle resize move and end
  useEffect(() => {
    if (!resizing || !nodeId) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = resizing.type === 'col'
        ? e.clientX - resizing.startPos
        : e.clientY - resizing.startPos

      const minSize = resizing.type === 'col' ? MIN_COLUMN_WIDTH : MIN_ROW_HEIGHT
      const newSize = Math.max(minSize, resizing.startSize + delta)

      if (resizing.type === 'col') {
        const newWidths = [...columnWidths]
        newWidths[resizing.index] = newSize
        const totalWidth = newWidths.reduce((sum, w) => sum + w, 0)
        const totalHeight = rowHeights.reduce((sum, h) => sum + h, 0)

        const newTableData = { ...tableData, columnWidths: newWidths }
        updateNode(nodeId, { tableData: newTableData })
        updateNodeDimensions([nodeId], { width: totalWidth, height: totalHeight })

        // Broadcast to collaborators (throttled by mouse move frequency)
        if (collaborationService.isConnected()) {
          collaborationService.broadcastOperation('node-update', nodeId, {
            data: { tableData: newTableData }
          })
        }
      } else {
        const newHeights = [...rowHeights]
        newHeights[resizing.index] = newSize
        const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0)
        const totalHeight = newHeights.reduce((sum, h) => sum + h, 0)

        const newTableData = { ...tableData, rowHeights: newHeights }
        updateNode(nodeId, { tableData: newTableData })
        updateNodeDimensions([nodeId], { width: totalWidth, height: totalHeight })

        // Broadcast to collaborators (throttled by mouse move frequency)
        if (collaborationService.isConnected()) {
          collaborationService.broadcastOperation('node-update', nodeId, {
            data: { tableData: newTableData }
          })
        }
      }
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, nodeId, tableData, columnWidths, rowHeights, updateNode, updateNodeDimensions])

  // Calculate total dimensions
  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0)
  const totalHeight = rowHeights.reduce((sum, h) => sum + h, 0)

  // Get cell background color based on position and settings
  const getCellBackground = (rowIndex: number, colIndex: number, isHeader: boolean): string => {
    if (isHeader) {
      return headerBgColor
    }

    const isBandedRow = bandedRows && rowIndex % 2 === 1
    const isBandedCol = bandedCols && colIndex % 2 === 1

    if (isBandedRow || isBandedCol) {
      return bandColor
    }

    return cellBgColor
  }

  // Get cell text color based on background
  const getCellTextColor = (rowIndex: number, colIndex: number, isHeader: boolean): string => {
    if (isHeader) {
      return headerTextColor
    }

    const bgColor = getCellBackground(rowIndex, colIndex, false)
    return getContrastingTextColor(bgColor, themeTextColor, style?.textColor)
  }

  // Calculate column positions for resize handles
  const getColResizeX = (colIndex: number): number => {
    let x = 0
    for (let i = 0; i <= colIndex; i++) {
      x += columnWidths[i] || DEFAULT_COLUMN_WIDTH
    }
    return x
  }

  // Calculate row positions for resize handles
  const getRowResizeY = (rowIndex: number): number => {
    let y = 0
    for (let i = 0; i <= rowIndex; i++) {
      y += rowHeights[i] || DEFAULT_ROW_HEIGHT
    }
    return y
  }

  return (
    <div
      ref={tableRef}
      className="table-shape overflow-visible rounded relative"
      style={{
        width: totalWidth,
        minHeight: totalHeight,
        border: `${baseStyle.borderWidth}px ${baseStyle.borderStyle} ${baseStyle.borderColor}`,
        borderRadius: baseStyle.borderRadius,
        boxShadow: baseStyle.boxShadow,
        filter: getDropShadowFilter(),
        opacity: baseStyle.opacity,
        fontFamily: baseStyle.fontFamily,
        fontSize: baseStyle.fontSize,
      }}
    >
      <table
        className="w-full border-collapse"
        style={{
          tableLayout: 'fixed',
        }}
      >
        <tbody>
          {Array.from({ length: tableData.rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: tableData.cols }).map((_, colIndex) => {
                const isHeaderRow = tableData.headerRow && rowIndex === 0
                const isHeaderCol = tableData.headerCol && colIndex === 0
                const isHeader = isHeaderRow || isHeaderCol
                const isEditing =
                  editingCell?.row === rowIndex && editingCell?.col === colIndex
                const cellContent = tableData.cells[rowIndex]?.[colIndex] || ''
                const width = columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH
                const height = rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT

                const bgColor = getCellBackground(rowIndex, colIndex, isHeader)
                const textColor = getCellTextColor(rowIndex, colIndex, isHeader)

                return (
                  <td
                    key={colIndex}
                    className={cn(
                      'relative border transition-colors',
                      isHeader ? 'font-semibold' : '',
                      !locked && 'cursor-text hover:opacity-90'
                    )}
                    style={{
                      width,
                      height,
                      minWidth: MIN_COLUMN_WIDTH,
                      minHeight: MIN_ROW_HEIGHT,
                      padding: 0,
                      borderColor: baseStyle.borderColor,
                      borderWidth: 1,
                      backgroundColor: bgColor,
                      color: textColor,
                      verticalAlign: 'middle',
                      textAlign: isHeader ? 'center' : (baseStyle.textAlign as 'left' | 'center' | 'right'),
                    }}
                    onDoubleClick={() => startEditing(rowIndex, colIndex)}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={cellValue}
                        onChange={(e) => setCellValue(e.target.value)}
                        onBlur={saveCell}
                        onKeyDown={handleKeyDown}
                        className="absolute inset-0 w-full h-full px-2 border-2 border-primary outline-none"
                        style={{
                          fontSize: 'inherit',
                          fontFamily: 'inherit',
                          backgroundColor: bgColor,
                          color: textColor,
                        }}
                      />
                    ) : (
                      <div
                        className="px-2 py-1 truncate"
                        style={{
                          lineHeight: `${height - 8}px`,
                        }}
                      >
                        {cellContent}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Column resize handles */}
      {!locked && Array.from({ length: tableData.cols - 1 }).map((_, colIndex) => (
        <div
          key={`col-resize-${colIndex}`}
          className="absolute top-0 w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary z-10"
          style={{
            left: getColResizeX(colIndex) - 2,
            height: totalHeight,
          }}
          onMouseDown={(e) => handleColResizeStart(e, colIndex)}
        />
      ))}

      {/* Row resize handles */}
      {!locked && Array.from({ length: tableData.rows - 1 }).map((_, rowIndex) => (
        <div
          key={`row-resize-${rowIndex}`}
          className="absolute left-0 h-1 cursor-row-resize hover:bg-primary/50 active:bg-primary z-10"
          style={{
            top: getRowResizeY(rowIndex) - 2,
            width: totalWidth,
          }}
          onMouseDown={(e) => handleRowResizeStart(e, rowIndex)}
        />
      ))}
    </div>
  )
}

registerShape('table', TableRenderer)

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'
import type { TableData } from '@/types'
import { useEditorStore } from '@/stores/editorStore'

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

function TableRenderer({ data, baseStyle, locked, getDropShadowFilter }: ShapeRenderProps) {
  const tableData = data.tableData || DEFAULT_TABLE_DATA
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [cellValue, setCellValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const updateNode = useEditorStore((state) => state.updateNode)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const nodes = useEditorStore((state) => state.nodes)

  // Get current node id from context
  const currentNode = nodes.find((n) => selectedNodes.includes(n.id) && n.data?.tableData === tableData)
  const nodeId = currentNode?.id

  // Column widths and row heights with defaults
  const columnWidths = tableData.columnWidths || Array(tableData.cols).fill(DEFAULT_COLUMN_WIDTH)
  const rowHeights = tableData.rowHeights || Array(tableData.rows).fill(DEFAULT_ROW_HEIGHT)

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

    updateNode(nodeId, {
      tableData: {
        ...tableData,
        cells: newCells,
      },
    })

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
        // Move to next row
        if (row < tableData.rows - 1) {
          startEditing(row + 1, col)
        }
      } else if (e.key === 'Tab') {
        e.preventDefault()
        saveCell()
        if (e.shiftKey) {
          // Move to previous cell
          if (col > 0) {
            startEditing(row, col - 1)
          } else if (row > 0) {
            startEditing(row - 1, tableData.cols - 1)
          }
        } else {
          // Move to next cell
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

  // Calculate total dimensions
  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0)
  const totalHeight = rowHeights.reduce((sum, h) => sum + h, 0)

  return (
    <div
      className="table-shape overflow-hidden rounded"
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

                return (
                  <td
                    key={colIndex}
                    className={cn(
                      'relative border transition-colors',
                      isHeader ? 'font-semibold' : '',
                      !locked && 'cursor-text hover:bg-primary/5'
                    )}
                    style={{
                      width,
                      height,
                      minWidth: MIN_COLUMN_WIDTH,
                      minHeight: MIN_ROW_HEIGHT,
                      padding: 0,
                      borderColor: baseStyle.borderColor,
                      borderWidth: 1,
                      backgroundColor: isHeader
                        ? 'rgba(0, 0, 0, 0.05)'
                        : baseStyle.backgroundColor,
                      color: baseStyle.color,
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
                        className="absolute inset-0 w-full h-full px-2 bg-background border-2 border-primary outline-none"
                        style={{
                          fontSize: 'inherit',
                          fontFamily: 'inherit',
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
    </div>
  )
}

registerShape('table', TableRenderer)

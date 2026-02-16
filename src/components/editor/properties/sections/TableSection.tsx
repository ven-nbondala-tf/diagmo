import { useRef, useCallback } from 'react'
import { Label, Input, Switch, AccordionItem, AccordionTrigger, AccordionContent, Button } from '@/components/ui'
import { Table2, Plus, Minus, Trash2, Upload, Download, Grid3X3, Palette, StretchHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { ColorPicker } from '../shared'
import { collaborationService } from '@/services/collaborationService'
import type { ShapeSectionProps } from '../types'
import type { TableData, TableStylePreset } from '@/types'

type Props = Pick<ShapeSectionProps, 'data' | 'selectedNode' | 'updateNode' | 'updateNodeDimensions'>

const DEFAULT_COLUMN_WIDTH = 100
const DEFAULT_ROW_HEIGHT = 32

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

// Table style presets (Excel-like)
const TABLE_STYLE_PRESETS: Record<TableStylePreset, { headerBg: string; headerText: string; bandColor: string; label: string }> = {
  default: { headerBg: '#f3f4f6', headerText: '#1f2937', bandColor: '#f9fafb', label: 'Default' },
  blue: { headerBg: '#3b82f6', headerText: '#ffffff', bandColor: '#dbeafe', label: 'Blue' },
  green: { headerBg: '#22c55e', headerText: '#ffffff', bandColor: '#dcfce7', label: 'Green' },
  orange: { headerBg: '#f97316', headerText: '#ffffff', bandColor: '#ffedd5', label: 'Orange' },
  purple: { headerBg: '#8b5cf6', headerText: '#ffffff', bandColor: '#ede9fe', label: 'Purple' },
  gray: { headerBg: '#6b7280', headerText: '#ffffff', bandColor: '#f3f4f6', label: 'Gray' },
  dark: { headerBg: '#1f2937', headerText: '#ffffff', bandColor: '#374151', label: 'Dark' },
}

function resizeTable(
  tableData: TableData,
  newRows: number,
  newCols: number
): TableData {
  const { cells, rows: oldRows, cols: oldCols, columnWidths: oldColWidths, rowHeights: oldRowHeights, ...rest } = tableData
  const newCells: string[][] = []

  for (let r = 0; r < newRows; r++) {
    const row: string[] = []
    for (let c = 0; c < newCols; c++) {
      const existingRow = r < oldRows ? cells[r] : undefined
      const existingCell = existingRow && c < oldCols ? existingRow[c] : undefined
      if (existingCell !== undefined) {
        row.push(existingCell)
      } else if (r === 0 && rest.headerRow) {
        row.push(`Header ${c + 1}`)
      } else {
        row.push('')
      }
    }
    newCells.push(row)
  }

  // Preserve/extend column widths
  const newColWidths = Array(newCols).fill(DEFAULT_COLUMN_WIDTH).map((def, i) =>
    oldColWidths && i < oldColWidths.length ? oldColWidths[i] : def
  )

  // Preserve/extend row heights
  const newRowHeights = Array(newRows).fill(DEFAULT_ROW_HEIGHT).map((def, i) =>
    oldRowHeights && i < oldRowHeights.length ? oldRowHeights[i] : def
  )

  return {
    ...rest,
    rows: newRows,
    cols: newCols,
    cells: newCells,
    columnWidths: newColWidths,
    rowHeights: newRowHeights,
  }
}

function calculateTableDimensions(tableData: TableData): { width: number; height: number } {
  const columnWidths = tableData.columnWidths || Array(tableData.cols).fill(DEFAULT_COLUMN_WIDTH)
  const rowHeights = tableData.rowHeights || Array(tableData.rows).fill(DEFAULT_ROW_HEIGHT)

  const width = columnWidths.reduce((sum, w) => sum + w, 0)
  const height = rowHeights.reduce((sum, h) => sum + h, 0)

  return { width, height }
}

function parseCSV(content: string): string[][] {
  const lines = content.trim().split(/\r?\n/)
  const rows: string[][] = []

  for (const line of lines) {
    const cells: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"'
          i++
        } else if (char === '"') {
          inQuotes = false
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          cells.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
    }
    cells.push(current.trim())
    rows.push(cells)
  }

  return rows
}

function tableToCSV(tableData: TableData): string {
  return tableData.cells
    .map((row) =>
      row
        .map((cell) => {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        })
        .join(',')
    )
    .join('\n')
}

export function TableSection({ data, selectedNode, updateNode, updateNodeDimensions }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (data.type !== 'table') return null

  const tableData = data.tableData || DEFAULT_TABLE_DATA

  const updateTableData = (updates: Partial<TableData>) => {
    const newTableData = { ...tableData, ...updates }
    updateNode(selectedNode.id, { tableData: newTableData })

    // Broadcast to collaborators
    if (collaborationService.isConnected()) {
      collaborationService.broadcastOperation('node-update', selectedNode.id, {
        data: { tableData: newTableData }
      })
    }

    if (updates.rows !== undefined || updates.cols !== undefined ||
        updates.columnWidths !== undefined || updates.rowHeights !== undefined) {
      const dims = calculateTableDimensions(newTableData)
      updateNodeDimensions([selectedNode.id], dims)
    }
  }

  const updateTableWithResize = (newData: TableData) => {
    updateNode(selectedNode.id, { tableData: newData })
    const dims = calculateTableDimensions(newData)
    updateNodeDimensions([selectedNode.id], dims)

    // Broadcast to collaborators
    if (collaborationService.isConnected()) {
      collaborationService.broadcastOperation('node-update', selectedNode.id, {
        data: { tableData: newData }
      })
    }
  }

  const handleAddRow = () => {
    const newData = resizeTable(tableData, tableData.rows + 1, tableData.cols)
    updateTableWithResize(newData)
  }

  const handleRemoveRow = () => {
    if (tableData.rows <= 1) return
    const newData = resizeTable(tableData, tableData.rows - 1, tableData.cols)
    updateTableWithResize(newData)
  }

  const handleAddColumn = () => {
    const newData = resizeTable(tableData, tableData.rows, tableData.cols + 1)
    updateTableWithResize(newData)
  }

  const handleRemoveColumn = () => {
    if (tableData.cols <= 1) return
    const newData = resizeTable(tableData, tableData.rows, tableData.cols - 1)
    updateTableWithResize(newData)
  }

  const handleClearTable = () => {
    const clearedCells = tableData.cells.map((row, ri) =>
      row.map((_, ci) => {
        if (ri === 0 && tableData.headerRow) return `Header ${ci + 1}`
        if (ci === 0 && tableData.headerCol) return `Row ${ri + 1}`
        return ''
      })
    )
    updateTableData({ cells: clearedCells })
  }

  const applyStylePreset = (preset: TableStylePreset) => {
    const presetStyle = TABLE_STYLE_PRESETS[preset]
    updateTableData({
      stylePreset: preset,
      headerBgColor: presetStyle.headerBg,
      headerTextColor: presetStyle.headerText,
      bandColor: presetStyle.bandColor,
    })
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        if (!content) {
          toast.error('Failed to read file content')
          return
        }

        const parsedRows = parseCSV(content)

        if (parsedRows.length === 0) {
          toast.error('CSV file is empty')
          return
        }

        const maxCols = Math.max(...parsedRows.map((row) => row.length))

        // Create normalized rows without mutating original
        const normalizedRows = parsedRows.map((row) => {
          const newRow = [...row]
          while (newRow.length < maxCols) {
            newRow.push('')
          }
          return newRow.slice(0, maxCols)
        })

        // Preserve existing style settings
        const newTableData: TableData = {
          rows: normalizedRows.length,
          cols: maxCols,
          cells: normalizedRows,
          columnWidths: Array(maxCols).fill(DEFAULT_COLUMN_WIDTH),
          rowHeights: Array(normalizedRows.length).fill(DEFAULT_ROW_HEIGHT),
          headerRow: tableData.headerRow,
          headerCol: tableData.headerCol,
          headerBgColor: tableData.headerBgColor,
          headerTextColor: tableData.headerTextColor,
          bandedRows: tableData.bandedRows,
          bandedCols: tableData.bandedCols,
          bandColor: tableData.bandColor,
          stylePreset: tableData.stylePreset,
        }

        updateNode(selectedNode.id, { tableData: newTableData })
        const dims = calculateTableDimensions(newTableData)
        updateNodeDimensions([selectedNode.id], dims)

        // Broadcast to collaborators
        if (collaborationService.isConnected()) {
          collaborationService.broadcastOperation('node-update', selectedNode.id, {
            data: { tableData: newTableData }
          })
        }

        toast.success(`Imported ${normalizedRows.length} rows, ${maxCols} columns`)
      } catch (err) {
        console.error('CSV import error:', err)
        toast.error('Failed to parse CSV file')
      }
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
    }
    reader.readAsText(file)

    // Reset file input
    if (event.target) {
      event.target.value = ''
    }
  }

  const handleExportCSV = useCallback(() => {
    const csvContent = tableToCSV(tableData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `table-${selectedNode.id.slice(0, 8)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported successfully')
  }, [tableData, selectedNode.id])

  return (
    <>
      {/* Structure Section */}
      <AccordionItem value="table-structure" className="border-b">
        <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
          <span className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Structure
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 space-y-4">
          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rows</Label>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleRemoveRow} disabled={tableData.rows <= 1}>
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={tableData.rows}
                  onChange={(e) => {
                    const newRows = Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                    const newData = resizeTable(tableData, newRows, tableData.cols)
                    updateTableWithResize(newData)
                  }}
                  min={1}
                  max={50}
                  className="h-7 w-14 text-xs text-center"
                />
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleAddRow} disabled={tableData.rows >= 50}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Columns</Label>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleRemoveColumn} disabled={tableData.cols <= 1}>
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={tableData.cols}
                  onChange={(e) => {
                    const newCols = Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                    const newData = resizeTable(tableData, tableData.rows, newCols)
                    updateTableWithResize(newData)
                  }}
                  min={1}
                  max={20}
                  className="h-7 w-14 text-xs text-center"
                />
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleAddColumn} disabled={tableData.cols >= 20}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Header Toggles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Header Row</Label>
              <Switch
                checked={tableData.headerRow}
                onCheckedChange={(checked) => updateTableData({ headerRow: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Header Column</Label>
              <Switch
                checked={tableData.headerCol}
                onCheckedChange={(checked) => updateTableData({ headerCol: checked })}
              />
            </div>
          </div>

          {/* Tip */}
          <div className="text-[10px] text-muted-foreground p-2 bg-muted/50 rounded">
            Drag column/row borders on canvas to resize
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Appearance Section */}
      <AccordionItem value="table-appearance" className="border-b">
        <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 space-y-4">
          {/* Quick Styles */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Styles</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.entries(TABLE_STYLE_PRESETS) as [TableStylePreset, typeof TABLE_STYLE_PRESETS[TableStylePreset]][]).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyStylePreset(key)}
                  className={`h-6 rounded text-[9px] font-medium transition-all ${
                    tableData.stylePreset === key
                      ? 'ring-2 ring-primary ring-offset-1'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: preset.headerBg,
                    color: preset.headerText,
                  }}
                  title={preset.label}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Header Colors */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Header Colors</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Background</Label>
                <ColorPicker
                  value={tableData.headerBgColor || '#f3f4f6'}
                  onChange={(color) => updateTableData({ headerBgColor: color, stylePreset: undefined })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Text</Label>
                <ColorPicker
                  value={tableData.headerTextColor || '#1f2937'}
                  onChange={(color) => updateTableData({ headerTextColor: color, stylePreset: undefined })}
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Banding Section */}
      <AccordionItem value="table-banding" className="border-b">
        <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
          <span className="flex items-center gap-2">
            <StretchHorizontal className="w-4 h-4" />
            Banding
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Banded Rows</Label>
            <Switch
              checked={tableData.bandedRows || false}
              onCheckedChange={(checked) => updateTableData({ bandedRows: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Banded Columns</Label>
            <Switch
              checked={tableData.bandedCols || false}
              onCheckedChange={(checked) => updateTableData({ bandedCols: checked })}
            />
          </div>
          {(tableData.bandedRows || tableData.bandedCols) && (
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Band Color</Label>
              <ColorPicker
                value={tableData.bandColor || '#f9fafb'}
                onChange={(color) => updateTableData({ bandColor: color, stylePreset: undefined })}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Data Section */}
      <AccordionItem value="table-data" className="border-b">
        <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
          <span className="flex items-center gap-2">
            <Table2 className="w-4 h-4" />
            Data
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 space-y-3">
          {/* Info */}
          <div className="text-[10px] text-muted-foreground p-2 bg-muted/50 rounded">
            Double-click cell to edit. Tab to navigate.
          </div>

          {/* Import/Export */}
          <div className="grid grid-cols-2 gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleImportCSV}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3 h-3 mr-1" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleExportCSV}
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>

          {/* Clear */}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs text-destructive hover:text-destructive"
            onClick={handleClearTable}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All Cells
          </Button>
        </AccordionContent>
      </AccordionItem>
    </>
  )
}

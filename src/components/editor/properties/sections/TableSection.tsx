import { Label, Input, Switch, AccordionItem, AccordionTrigger, AccordionContent, Button } from '@/components/ui'
import { Table2, Plus, Minus, Trash2 } from 'lucide-react'
import type { ShapeSectionProps } from '../types'
import type { TableData } from '@/types'

type Props = Pick<ShapeSectionProps, 'data' | 'selectedNode' | 'updateNode'>

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

function resizeTable(
  tableData: TableData,
  newRows: number,
  newCols: number
): TableData {
  const { cells, rows: oldRows, cols: oldCols, ...rest } = tableData
  const newCells: string[][] = []

  for (let r = 0; r < newRows; r++) {
    const row: string[] = []
    for (let c = 0; c < newCols; c++) {
      // Preserve existing cell content or use empty string
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

  return {
    ...rest,
    rows: newRows,
    cols: newCols,
    cells: newCells,
  }
}

export function TableSection({ data, selectedNode, updateNode }: Props) {
  // Only show for table shapes
  if (data.type !== 'table') return null

  const tableData = data.tableData || DEFAULT_TABLE_DATA

  const updateTableData = (updates: Partial<TableData>) => {
    updateNode(selectedNode.id, {
      tableData: {
        ...tableData,
        ...updates,
      },
    })
  }

  const handleAddRow = () => {
    const newData = resizeTable(tableData, tableData.rows + 1, tableData.cols)
    updateNode(selectedNode.id, { tableData: newData })
  }

  const handleRemoveRow = () => {
    if (tableData.rows <= 1) return
    const newData = resizeTable(tableData, tableData.rows - 1, tableData.cols)
    updateNode(selectedNode.id, { tableData: newData })
  }

  const handleAddColumn = () => {
    const newData = resizeTable(tableData, tableData.rows, tableData.cols + 1)
    updateNode(selectedNode.id, { tableData: newData })
  }

  const handleRemoveColumn = () => {
    if (tableData.cols <= 1) return
    const newData = resizeTable(tableData, tableData.rows, tableData.cols - 1)
    updateNode(selectedNode.id, { tableData: newData })
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

  return (
    <AccordionItem value="table" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Table2 className="w-4 h-4" />
          Table Data
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Rows</Label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleRemoveRow}
                disabled={tableData.rows <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Input
                type="number"
                value={tableData.rows}
                onChange={(e) => {
                  const newRows = Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                  const newData = resizeTable(tableData, newRows, tableData.cols)
                  updateNode(selectedNode.id, { tableData: newData })
                }}
                min={1}
                max={20}
                className="h-7 w-14 text-xs text-center"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleAddRow}
                disabled={tableData.rows >= 20}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Columns</Label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleRemoveColumn}
                disabled={tableData.cols <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Input
                type="number"
                value={tableData.cols}
                onChange={(e) => {
                  const newCols = Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                  const newData = resizeTable(tableData, tableData.rows, newCols)
                  updateNode(selectedNode.id, { tableData: newData })
                }}
                min={1}
                max={10}
                className="h-7 w-14 text-xs text-center"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleAddColumn}
                disabled={tableData.cols >= 10}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Header Options */}
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Headers</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Header Row (first row)</Label>
              <Switch
                checked={tableData.headerRow}
                onCheckedChange={(checked) => updateTableData({ headerRow: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Header Column (first column)</Label>
              <Switch
                checked={tableData.headerCol}
                onCheckedChange={(checked) => updateTableData({ headerCol: checked })}
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
          Double-click a cell to edit. Use Tab to navigate.
        </div>

        {/* Clear button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={handleClearTable}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear All Cells
        </Button>
      </AccordionContent>
    </AccordionItem>
  )
}

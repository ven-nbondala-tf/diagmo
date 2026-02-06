import { Label, AccordionItem, AccordionTrigger, AccordionContent, Button, Input } from '@/components/ui'
import { Database, Code2, Plus, Trash2, Key } from 'lucide-react'
import type { ShapeSectionProps } from '../types'
import type { UMLAttribute, UMLMethod, DBColumn } from '@/types'

type Props = Pick<ShapeSectionProps, 'data' | 'updateAllSelectedData'>

// UML Class Data Section
export function UMLClassDataSection({ data, updateAllSelectedData }: Props) {
  const attributes = data.umlAttributes ?? []
  const methods = data.umlMethods ?? []
  const stereotype = data.umlStereotype ?? ''

  const addAttribute = () => {
    const newAttr: UMLAttribute = { visibility: '+', name: 'newAttr', type: 'Type' }
    updateAllSelectedData({ umlAttributes: [...attributes, newAttr] })
  }

  const updateAttribute = (index: number, updates: Partial<UMLAttribute>) => {
    const updated = attributes.map((attr, i) => i === index ? { ...attr, ...updates } : attr)
    updateAllSelectedData({ umlAttributes: updated })
  }

  const removeAttribute = (index: number) => {
    updateAllSelectedData({ umlAttributes: attributes.filter((_, i) => i !== index) })
  }

  const addMethod = () => {
    const newMethod: UMLMethod = { visibility: '+', name: 'newMethod', parameters: '', returnType: 'void' }
    updateAllSelectedData({ umlMethods: [...methods, newMethod] })
  }

  const updateMethod = (index: number, updates: Partial<UMLMethod>) => {
    const updated = methods.map((method, i) => i === index ? { ...method, ...updates } : method)
    updateAllSelectedData({ umlMethods: updated })
  }

  const removeMethod = (index: number) => {
    updateAllSelectedData({ umlMethods: methods.filter((_, i) => i !== index) })
  }

  return (
    <AccordionItem value="uml-data" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Code2 className="w-4 h-4" />
          Class Data
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        {/* Stereotype */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Stereotype</Label>
          <Input
            value={stereotype}
            onChange={(e) => updateAllSelectedData({ umlStereotype: e.target.value })}
            placeholder="e.g., abstract, interface"
            className="h-7 text-xs"
          />
        </div>

        {/* Attributes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Attributes</Label>
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={addAttribute}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {attributes.map((attr, i) => (
              <div key={i} className="flex items-center gap-1">
                <select
                  value={attr.visibility}
                  onChange={(e) => updateAttribute(i, { visibility: e.target.value as UMLAttribute['visibility'] })}
                  className="w-10 h-6 text-xs border rounded px-1 bg-background"
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                  <option value="#">#</option>
                  <option value="~">~</option>
                </select>
                <Input
                  value={attr.name}
                  onChange={(e) => updateAttribute(i, { name: e.target.value })}
                  placeholder="name"
                  className="h-6 text-xs flex-1"
                />
                <Input
                  value={attr.type}
                  onChange={(e) => updateAttribute(i, { type: e.target.value })}
                  placeholder="type"
                  className="h-6 text-xs w-20"
                />
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeAttribute(i)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))}
            {attributes.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No attributes</p>
            )}
          </div>
        </div>

        {/* Methods */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Methods</Label>
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={addMethod}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {methods.map((method, i) => (
              <div key={i} className="flex items-center gap-1">
                <select
                  value={method.visibility}
                  onChange={(e) => updateMethod(i, { visibility: e.target.value as UMLMethod['visibility'] })}
                  className="w-10 h-6 text-xs border rounded px-1 bg-background"
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                  <option value="#">#</option>
                  <option value="~">~</option>
                </select>
                <Input
                  value={method.name}
                  onChange={(e) => updateMethod(i, { name: e.target.value })}
                  placeholder="name"
                  className="h-6 text-xs flex-1"
                />
                <Input
                  value={method.returnType || ''}
                  onChange={(e) => updateMethod(i, { returnType: e.target.value })}
                  placeholder="return"
                  className="h-6 text-xs w-16"
                />
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeMethod(i)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))}
            {methods.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No methods</p>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

// Database Columns Section
export function DatabaseDataSection({ data, updateAllSelectedData }: Props) {
  const columns = data.dbColumns ?? []

  const addColumn = () => {
    const newCol: DBColumn = { name: 'new_column', type: 'VARCHAR(255)' }
    updateAllSelectedData({ dbColumns: [...columns, newCol] })
  }

  const updateColumn = (index: number, updates: Partial<DBColumn>) => {
    const updated = columns.map((col, i) => i === index ? { ...col, ...updates } : col)
    updateAllSelectedData({ dbColumns: updated })
  }

  const removeColumn = (index: number) => {
    updateAllSelectedData({ dbColumns: columns.filter((_, i) => i !== index) })
  }

  const togglePrimaryKey = (index: number) => {
    const col = columns[index]
    if (col) updateColumn(index, { isPrimaryKey: !col.isPrimaryKey })
  }

  return (
    <AccordionItem value="db-data" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Columns
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Table Columns</Label>
          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={addColumn}>
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-1">
          {columns.map((col, i) => (
            <div key={i} className="flex items-center gap-1">
              <Button
                variant={col.isPrimaryKey ? 'default' : 'ghost'}
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => togglePrimaryKey(i)}
                title={col.isPrimaryKey ? 'Primary Key' : 'Set as Primary Key'}
              >
                <Key className="w-3 h-3" />
              </Button>
              <Input
                value={col.name}
                onChange={(e) => updateColumn(i, { name: e.target.value })}
                placeholder="column_name"
                className="h-6 text-xs flex-1"
              />
              <Input
                value={col.type}
                onChange={(e) => updateColumn(i, { type: e.target.value })}
                placeholder="type"
                className="h-6 text-xs w-24"
              />
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeColumn(i)}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))}
          {columns.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No columns defined</p>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground">
          Click the key icon to mark a column as primary key
        </p>
      </AccordionContent>
    </AccordionItem>
  )
}

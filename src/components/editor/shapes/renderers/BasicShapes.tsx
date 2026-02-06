import { cn } from '@/utils'
import { registerShape, registerShapes } from '../registry'
import type { ShapeRenderProps } from '../types'
import type { DBColumn } from '@/types'

// Default columns for new database shapes
const DEFAULT_DB_COLUMNS: DBColumn[] = [
  { name: 'id', type: 'INT', isPrimaryKey: true },
  { name: 'name', type: 'VARCHAR(255)' },
  { name: 'created_at', type: 'TIMESTAMP' },
]

// Wrapper for proper text wrapping in flexbox
function LabelText({ label }: { label: string }) {
  return <span className="min-w-0 max-w-full break-words">{label}</span>
}

function RectangleShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div className={shapeClass} style={getShapeStyle()}>
      <LabelText label={label} />
    </div>
  )
}

function EllipseShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'rounded-full')}
      style={getShapeStyle({ borderRadius: '50%' })}
    >
      <LabelText label={label} />
    </div>
  )
}

function CircleShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'rounded-full aspect-square')}
      style={getShapeStyle({ borderRadius: '50%' })}
    >
      <LabelText label={label} />
    </div>
  )
}

function RoundedRectangleShape({ label, style, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={shapeClass}
      style={getShapeStyle({ borderRadius: style?.borderRadius ?? 16 })}
    >
      <LabelText label={label} />
    </div>
  )
}

function CylinderShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={shapeClass}
      style={getShapeStyle({ borderRadius: '10px 10px 50% 50% / 10px 10px 20px 20px' })}
    >
      <LabelText label={label} />
    </div>
  )
}

function DatabaseShape({ label, locked, baseStyle, getShapeStyle, data }: ShapeRenderProps) {
  const columns = data.dbColumns ?? DEFAULT_DB_COLUMNS

  return (
    <div
      className={cn('w-full h-full flex flex-col overflow-hidden', locked && 'opacity-75')}
      style={getShapeStyle({ borderRadius: '10px 10px 50% 50% / 10px 10px 20px 20px' })}
    >
      {/* Table name header */}
      <div
        className="border-b px-2 py-1 font-bold text-center text-sm"
        style={{ borderColor: baseStyle.borderColor, color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
      >
        {label || 'table_name'}
      </div>

      {/* Columns section */}
      <div
        className="flex-1 px-2 py-1 text-xs text-left overflow-y-auto"
        style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
      >
        {columns.length > 0 ? (
          columns.map((col, i) => (
            <div key={i} className="flex items-center gap-1">
              {col.isPrimaryKey && <span className="text-amber-500" title="Primary Key">🔑</span>}
              <span className={col.isPrimaryKey ? 'font-semibold' : ''}>{col.name}</span>
              <span className="text-muted-foreground">: {col.type}</span>
              {col.isNullable && <span className="text-muted-foreground text-[10px]">(null)</span>}
            </div>
          ))
        ) : (
          <div className="text-muted-foreground italic">No columns</div>
        )}
      </div>
    </div>
  )
}

function CloudShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={shapeClass}
      style={getShapeStyle({ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' })}
    >
      <LabelText label={label} />
    </div>
  )
}

function TerminatorShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'rounded-full')}
      style={getShapeStyle({ borderRadius: 9999 })}
    >
      <LabelText label={label} />
    </div>
  )
}

function DelayShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={shapeClass}
      style={getShapeStyle({ borderRadius: '0 50% 50% 0' })}
    >
      <LabelText label={label} />
    </div>
  )
}

// Register all basic shapes
registerShapes(['rectangle', 'process'], RectangleShape)
registerShape('ellipse', EllipseShape)
registerShape('circle', CircleShape)
registerShape('rounded-rectangle', RoundedRectangleShape)
registerShape('cylinder', CylinderShape)
registerShape('database', DatabaseShape)
registerShape('cloud', CloudShape)
registerShape('terminator', TerminatorShape)
registerShape('delay', DelayShape)

import { useColorStore } from '@/stores/colorStore'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  presets?: string[]
}

export function ColorPicker({
  value,
  onChange,
  presets = ['#6b7280', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#000000']
}: ColorPickerProps) {
  const recentColors = useColorStore((s) => s.recentColors)
  const addRecentColor = useColorStore((s) => s.addRecentColor)

  const handleChange = (color: string) => {
    addRecentColor(color)
    onChange(color)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-8 h-7 rounded border cursor-pointer"
        />
        <div className="flex gap-0.5 flex-1">
          {presets.map((color) => (
            <button
              key={color}
              className="w-5 h-5 rounded border hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => handleChange(color)}
            />
          ))}
        </div>
      </div>
      {recentColors.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-8 text-center shrink-0">Recent</span>
          <div className="flex gap-0.5 flex-1">
            {recentColors.map((color) => (
              <button
                key={color}
                className="w-5 h-5 rounded border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useColorStore } from '@/stores/colorStore'
import { Input, Popover, PopoverTrigger, PopoverContent } from '@/components/ui'

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
  const [hexInput, setHexInput] = useState(value)

  useEffect(() => {
    setHexInput(value)
  }, [value])

  const handleChange = (color: string) => {
    addRecentColor(color)
    setHexInput(color)
    onChange(color)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
      handleChange(val)
    }
  }

  const handleHexInputBlur = () => {
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hexInput)) {
      setHexInput(value)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 h-8 px-2 border rounded-md hover:bg-accent transition-colors w-full"
        >
          <div
            className="w-5 h-5 rounded border shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs font-mono text-muted-foreground truncate">{value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start" side="left" sideOffset={8}>
        <div className="space-y-3">
          <input
            type="color"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-8 rounded border cursor-pointer"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-8">Hex</span>
            <Input
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={handleHexInputBlur}
              placeholder="#000000"
              className="h-7 text-xs font-mono"
            />
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block mb-1">Presets</span>
            <div className="flex gap-1 flex-wrap">
              {presets.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange(color)}
                />
              ))}
            </div>
          </div>

          {recentColors.length > 0 && (
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1">Recent</span>
              <div className="flex gap-1 flex-wrap">
                {recentColors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => onChange(color)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

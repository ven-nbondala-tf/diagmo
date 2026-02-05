import type { NodeStyle } from '@/types'
import { STYLE_PRESETS } from '@/constants/stylePresets'
import { useEditorStore } from '@/stores/editorStore'
import { cn } from '@/utils'

interface PresetPickerProps {
  currentStyle: Partial<NodeStyle>
  onApply: (style: Partial<NodeStyle>) => void
}

export function PresetPicker({ currentStyle, onApply }: PresetPickerProps) {
  const pushHistory = useEditorStore((s) => s.pushHistory)

  const activePreset = STYLE_PRESETS.find(
    (p) =>
      p.style.backgroundColor === currentStyle.backgroundColor &&
      p.style.borderColor === currentStyle.borderColor &&
      p.style.textColor === currentStyle.textColor
  )

  const handleApply = (style: Partial<NodeStyle>) => {
    pushHistory()
    onApply(style)
  }

  return (
    <div className="px-4 py-3 border-b">
      <span className="text-[10px] text-muted-foreground block mb-2">Style Presets</span>
      <div className="flex gap-2">
        {STYLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={cn(
              'flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all hover:scale-105',
              activePreset?.id === preset.id
                ? 'border-primary ring-1 ring-primary/30 bg-primary/5'
                : 'border-transparent hover:border-border'
            )}
            onClick={() => handleApply(preset.style)}
            title={preset.name}
          >
            <div
              className="w-9 h-6 rounded"
              style={{
                backgroundColor: preset.preview.bg,
                borderColor: preset.preview.border,
                borderWidth: 1.5,
                borderStyle: 'solid',
              }}
            >
              <span
                className="flex items-center justify-center h-full text-[7px] font-bold"
                style={{ color: preset.preview.text }}
              >
                Aa
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground leading-none">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

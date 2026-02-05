import { useState, useCallback } from 'react'
import { Input, Label, Slider } from '@/components/ui'

interface SliderWithInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}

export function SliderWithInput({ label, value, onChange, min, max, step = 1, unit = '' }: SliderWithInputProps) {
  const [inputValue, setInputValue] = useState(String(value))

  const handleSliderChange = useCallback(([val]: number[]) => {
    setInputValue(String(val))
    onChange(val)
  }, [onChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    const num = parseFloat(val)
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num)
    }
  }, [onChange, min, max])

  const handleInputBlur = useCallback(() => {
    let num = parseFloat(inputValue)
    if (isNaN(num)) num = min
    num = Math.max(min, Math.min(max, num))
    setInputValue(String(num))
    onChange(num)
  }, [inputValue, min, max, onChange])

  // Sync input with value when it changes externally
  if (parseFloat(inputValue) !== value && document.activeElement?.tagName !== 'INPUT') {
    setInputValue(String(value))
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            step={step}
            className="h-6 w-12 text-xs text-center px-1"
          />
          {unit && <span className="text-xs text-muted-foreground w-4">{unit}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
}

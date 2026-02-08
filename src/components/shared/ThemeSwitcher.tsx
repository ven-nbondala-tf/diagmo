// Theme Switcher - Dropdown with Light/Dark/System options

import { useThemeStore } from '@/stores/themeStore'
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

interface ThemeSwitcherProps {
  className?: string
  showLabel?: boolean
}

export function ThemeSwitcher({ className, showLabel = true }: ThemeSwitcherProps) {
  const { mode, setMode } = useThemeStore()

  const currentOption = themeOptions.find((opt) => opt.value === mode)!
  const CurrentIcon = currentOption.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors cursor-pointer',
            className
          )}
        >
          <CurrentIcon className="w-4 h-4" />
          {showLabel && (
            <span className="text-sm hidden sm:inline">{currentOption.label}</span>
          )}
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setMode(value)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
            {mode === value && <Check className="w-4 h-4 text-supabase-green" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

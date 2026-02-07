import { useThemeStore } from '@/stores/themeStore'
import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setMode('light')} className="flex justify-between">
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            Light
          </div>
          {mode === 'light' && <Check className="h-4 w-4 text-supabase-green" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('dark')} className="flex justify-between">
          <div className="flex items-center">
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </div>
          {mode === 'dark' && <Check className="h-4 w-4 text-supabase-green" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('system')} className="flex justify-between">
          <div className="flex items-center">
            <Monitor className="mr-2 h-4 w-4" />
            System
          </div>
          {mode === 'system' && <Check className="h-4 w-4 text-supabase-green" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils'

interface IconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  active?: boolean
  size?: 'xs' | 'sm'
  variant?: 'ghost' | 'outline'
}

export function IconButton({ icon: Icon, label, onClick, active, size = 'sm', variant = 'ghost' }: IconButtonProps) {
  const sizeClasses = size === 'xs' ? 'w-7 h-7' : 'w-8 h-8'
  const iconSize = size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        sizeClasses,
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        variant === 'outline' && 'border hover:bg-accent hover:text-accent-foreground',
        active && 'bg-accent text-accent-foreground'
      )}
      onClick={onClick}
      title={label}
    >
      <Icon className={iconSize} />
    </button>
  )
}

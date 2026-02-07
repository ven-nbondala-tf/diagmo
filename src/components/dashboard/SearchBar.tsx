import { Input } from '@/components/ui'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search diagrams...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-supabase-text-muted" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 bg-supabase-bg-secondary border-supabase-border text-supabase-text-primary placeholder:text-supabase-text-muted focus:border-supabase-green/50 focus:ring-supabase-green/20"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-supabase-text-muted hover:text-supabase-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

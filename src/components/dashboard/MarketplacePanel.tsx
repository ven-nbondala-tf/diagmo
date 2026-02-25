/**
 * Marketplace Panel
 * Browse and use community templates
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  marketplaceService,
  MARKETPLACE_CATEGORIES,
  type MarketplaceTemplate,
  type MarketplaceSortBy,
} from '@/services/marketplaceService'
import { useEditorStore } from '@/stores/editorStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  ScrollArea,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui'
import { cn } from '@/utils'
import {
  Search,
  Star,
  Download,
  TrendingUp,
  Clock,
  Award,
  User,
  CheckCircle,
  X,
  Upload,
  ChevronRight,
  Sparkles,
  Filter,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'

interface MarketplacePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUseTemplate?: (nodes: unknown[], edges: unknown[]) => void
}

// Star rating display
function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-3 h-3',
              star <= rating
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-muted-foreground'
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  )
}

// Template card
function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: MarketplaceTemplate
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'text-left p-3 rounded-lg border-2 transition-all cursor-pointer group',
        'hover:border-primary/50 hover:shadow-sm',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-transparent bg-muted/50'
      )}
    >
      {/* Thumbnail */}
      <div className="w-full h-28 bg-gradient-to-br from-muted to-muted/50 rounded border overflow-hidden relative">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1.5 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-3 rounded-sm bg-primary/20"
                />
              ))}
            </div>
          </div>
        )}
        {template.featured && (
          <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-1.5">
            <Sparkles className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {template.price !== 'free' && (
          <Badge className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-1.5">
            ${(template.price as number / 100).toFixed(2)}
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm line-clamp-1">{template.name}</h3>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>

        {/* Author */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {template.author.avatarUrl ? (
            <img
              src={template.author.avatarUrl}
              alt={template.author.name}
              className="w-4 h-4 rounded-full"
            />
          ) : (
            <User className="w-3 h-3" />
          )}
          <span className="truncate">{template.author.name}</span>
          {template.author.verified && (
            <CheckCircle className="w-3 h-3 text-blue-500" />
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <StarRating rating={template.rating} count={template.ratingCount} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="w-3 h-3" />
            {template.downloads.toLocaleString()}
          </div>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

// Loading skeleton
function TemplateSkeleton() {
  return (
    <div className="p-3 rounded-lg border-2 border-transparent bg-muted/50">
      <Skeleton className="w-full h-28 rounded" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function MarketplacePanel({
  open,
  onOpenChange,
  onUseTemplate,
}: MarketplacePanelProps) {
  const navigate = useNavigate()
  const secondaryAccentColor = usePreferencesStore((s) => s.secondaryAccentColor)
  const secondaryAccentTextColor = usePreferencesStore((s) => s.secondaryAccentTextColor)

  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [featuredTemplates, setFeaturedTemplates] = useState<MarketplaceTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<MarketplaceSortBy>('popular')
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null)
  const [using, setUsing] = useState(false)

  // Load templates
  useEffect(() => {
    if (!open) return

    const loadTemplates = async () => {
      setLoading(true)
      try {
        const [featured, browse] = await Promise.all([
          marketplaceService.getFeaturedTemplates(6),
          marketplaceService.browseTemplates(
            selectedCategory !== 'all' ? { category: selectedCategory } : undefined,
            sortBy,
            50
          ),
        ])
        setFeaturedTemplates(featured)
        setTemplates(browse.templates)
      } catch (error) {
        console.error('Failed to load marketplace:', error)
        // Use empty arrays as fallback
        setFeaturedTemplates([])
        setTemplates([])
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [open, selectedCategory, sortBy])

  // Search
  useEffect(() => {
    if (!open || !searchQuery.trim()) return

    const searchTemplates = async () => {
      setLoading(true)
      try {
        const results = await marketplaceService.searchTemplates(
          searchQuery,
          selectedCategory !== 'all' ? { category: selectedCategory } : undefined
        )
        setTemplates(results)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchTemplates, 300)
    return () => clearTimeout(debounce)
  }, [open, searchQuery, selectedCategory])

  // Use template
  const handleUseTemplate = useCallback(async () => {
    if (!selectedTemplate) return

    setUsing(true)
    try {
      const result = await marketplaceService.useTemplate(selectedTemplate.id)

      if (onUseTemplate) {
        onUseTemplate(result.nodes, result.edges)
      } else {
        // Import into editor store
        useEditorStore.getState().importDiagram(result.nodes, result.edges)
        navigate('/editor/new')
      }

      toast.success(`Template "${selectedTemplate.name}" added`)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to use template:', error)
      toast.error('Failed to use template')
    } finally {
      setUsing(false)
    }
  }, [selectedTemplate, onUseTemplate, navigate, onOpenChange])

  // Filtered templates
  const displayTemplates = useMemo(() => {
    if (searchQuery.trim()) {
      return templates
    }
    return templates
  }, [templates, searchQuery])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Template Marketplace
          </DialogTitle>
          <DialogDescription>
            Discover and use community-created templates for your diagrams
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 gap-4">
          {/* Search and filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as MarketplaceSortBy)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Popular
                  </div>
                </SelectItem>
                <SelectItem value="recent">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Recent
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3" />
                    Top Rated
                  </div>
                </SelectItem>
                <SelectItem value="downloads">
                  <div className="flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    Downloads
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="space-y-6 pr-4">
              {/* Featured section */}
              {!searchQuery && featuredTemplates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold">Featured Templates</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {featuredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        selected={selectedTemplate?.id === template.id}
                        onSelect={() => setSelectedTemplate(template)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All templates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">
                    {searchQuery ? 'Search Results' : 'All Templates'}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {displayTemplates.length} templates
                  </span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TemplateSkeleton key={i} />
                    ))}
                  </div>
                ) : displayTemplates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No templates found</p>
                    <p className="text-sm mt-1">Try a different search or category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {displayTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        selected={selectedTemplate?.id === template.id}
                        onSelect={() => setSelectedTemplate(template)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedTemplate ? (
              <span>
                Selected: <strong>{selectedTemplate.name}</strong>
                {' by '}
                {selectedTemplate.author.name}
              </span>
            ) : (
              'Select a template to use'
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUseTemplate}
              disabled={!selectedTemplate || using}
              style={{ backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor }}
              className="hover:opacity-90"
            >
              {using ? 'Loading...' : 'Use Template'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, Image, Sparkles, Loader2, ExternalLink } from 'lucide-react'
import { Input, ScrollArea } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/useDebounce'
import {
  searchImages,
  type ImageSearchType,
  type WebImageResult,
} from '@/services/imageSearchService'

interface WebImageSearchProps {
  onImageSelect?: (image: WebImageResult) => void
}

export function WebImageSearch({ onImageSelect }: WebImageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ImageSearchType>('photos')
  const [results, setResults] = useState<WebImageResult[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(searchQuery, 300)

  // Search when query or tab changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setPage(1)
      setHasMore(true)
      return
    }

    const doSearch = async () => {
      setLoading(true)
      try {
        const searchResults = await searchImages(activeTab, debouncedQuery, 1)
        setResults(searchResults)
        setPage(1)
        setHasMore(searchResults.length >= 20)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    doSearch()
  }, [debouncedQuery, activeTab])

  // Load more on scroll
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !debouncedQuery.trim()) return

    setLoading(true)
    try {
      const nextPage = page + 1
      const moreResults = await searchImages(activeTab, debouncedQuery, nextPage)
      if (moreResults.length === 0) {
        setHasMore(false)
      } else {
        setResults((prev) => [...prev, ...moreResults])
        setPage(nextPage)
        setHasMore(moreResults.length >= 20)
      }
    } catch (error) {
      console.error('Load more error:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, debouncedQuery, activeTab, page])

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight
      if (scrollBottom < 100 && !loading && hasMore) {
        loadMore()
      }
    },
    [loadMore, loading, hasMore]
  )

  // Handle drag start for canvas drop
  const handleDragStart = useCallback(
    (e: React.DragEvent, image: WebImageResult) => {
      // Set data for the drop handler
      e.dataTransfer.setData('application/reactflow', 'web-image')
      e.dataTransfer.setData('application/json', JSON.stringify({
        imageUrl: image.downloadUrl,
        thumbnailUrl: image.thumbnailUrl,
        imageType: image.type,
        width: image.width,
        height: image.height,
        alt: image.alt,
        attribution: image.attribution,
      }))
      // Must match DiagramEditor's onDragOver dropEffect ('move')
      e.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  // Handle click to add to center of canvas
  const handleClick = useCallback(
    (image: WebImageResult) => {
      onImageSelect?.(image)
    },
    [onImageSelect]
  )

  const renderResults = () => {
    if (loading && results.length === 0) {
      return (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (!searchQuery.trim()) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm px-4 text-center">
          <Search className="w-8 h-8 mb-2 opacity-30" />
          <p>Search for {activeTab === 'photos' ? 'photos' : activeTab === 'icons' ? 'icons' : 'GIFs'}</p>
          <p className="text-xs mt-1">
            {activeTab === 'photos' && 'Powered by Unsplash'}
            {activeTab === 'icons' && 'Powered by Iconify (200k+ icons)'}
            {activeTab === 'gifs' && 'Powered by GIPHY'}
          </p>
        </div>
      )
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
          <p>No results found for "{searchQuery}"</p>
        </div>
      )
    }

    return (
      <div
        className={`grid gap-2 p-2 ${
          activeTab === 'icons' ? 'grid-cols-4' : 'grid-cols-3'
        }`}
      >
        {results.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square border rounded-md overflow-hidden cursor-grab active:cursor-grabbing hover:border-primary hover:ring-2 hover:ring-primary/20 transition-all bg-muted/30"
            draggable
            onDragStart={(e) => handleDragStart(e, image)}
            onClick={() => handleClick(image)}
            title={image.alt}
          >
            {activeTab === 'icons' ? (
              // SVG icons render directly
              <div className="w-full h-full flex items-center justify-center p-2">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-8 h-8 object-contain pointer-events-none select-none"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ) : (
              // Photos and GIFs - draggable=false prevents native image drag from overriding
              <img
                src={image.thumbnailUrl}
                alt={image.alt}
                className="w-full h-full object-cover pointer-events-none select-none"
                loading="lazy"
                draggable={false}
              />
            )}

            {/* Attribution overlay */}
            {image.attribution && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                <a
                  href={image.attribution.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {image.attribution.name}
                  <ExternalLink className="w-2 h-2" />
                </a>
              </div>
            )}
          </div>
        ))}

        {/* Loading more indicator */}
        {loading && results.length > 0 && (
          <div className="col-span-full flex justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Image type tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ImageSearchType)}
        className="flex-1 flex flex-col"
      >
        <div className="px-3 pt-2">
          <TabsList className="w-full grid grid-cols-3 h-8">
            <TabsTrigger value="photos" className="text-xs h-7 px-2">
              <Image className="w-3 h-3 mr-1" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="icons" className="text-xs h-7 px-2">
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              Icons
            </TabsTrigger>
            <TabsTrigger value="gifs" className="text-xs h-7 px-2">
              <Sparkles className="w-3 h-3 mr-1" />
              GIFs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="photos" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <ScrollArea
            ref={scrollRef}
            className="h-[calc(100vh-280px)]"
            onScroll={handleScroll}
          >
            {renderResults()}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="icons" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <ScrollArea
            className="h-[calc(100vh-280px)]"
            onScroll={handleScroll}
          >
            {renderResults()}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gifs" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <ScrollArea
            className="h-[calc(100vh-280px)]"
            onScroll={handleScroll}
          >
            {renderResults()}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Attribution footer */}
      <div className="p-2 border-t text-[10px] text-muted-foreground text-center">
        {activeTab === 'photos' && 'Photos by Unsplash'}
        {activeTab === 'icons' && 'Icons by Iconify'}
        {activeTab === 'gifs' && 'Powered by GIPHY'}
      </div>
    </div>
  )
}

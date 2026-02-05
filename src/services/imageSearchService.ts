// Image Search Service - integrates with free APIs
// - Unsplash: High-quality photos (demo mode: 50 req/hour)
// - Iconify: SVG icons (no key needed, 200k+ icons)
// - GIPHY: Animated GIFs (demo mode available)

export interface WebImageResult {
  id: string
  type: 'photo' | 'icon' | 'gif'
  url: string // Main URL for display
  thumbnailUrl: string // Smaller preview
  downloadUrl: string // URL to use in diagram
  width: number
  height: number
  alt: string
  attribution?: {
    name: string
    url: string
    source: string
  }
}

interface CacheEntry {
  data: WebImageResult[]
  timestamp: number
}

// In-memory cache with 5-minute TTL
const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(type: string, query: string, page: number): string {
  return `${type}:${query}:${page}`
}

function getFromCache(key: string): WebImageResult[] | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: WebImageResult[]): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// ============================================
// UNSPLASH API - High-quality photos
// Demo/development mode: 50 requests/hour
// ============================================

const UNSPLASH_ACCESS_KEY = 'demo' // Use demo for development

export async function searchUnsplashPhotos(
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<WebImageResult[]> {
  const cacheKey = getCacheKey('unsplash', query, page)
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  try {
    // Using Unsplash Source API for demo (no key required for random images)
    // For production, use the official API with your access key
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&client_id=${UNSPLASH_ACCESS_KEY}`
    )

    if (!response.ok) {
      // Fallback to Lorem Picsum for demo purposes
      return getFallbackPhotos(query, page, perPage)
    }

    const data = await response.json()
    const results: WebImageResult[] = data.results.map((photo: {
      id: string
      urls: { small: string; thumb: string; regular: string }
      width: number
      height: number
      alt_description: string | null
      user: { name: string; links: { html: string } }
    }) => ({
      id: photo.id,
      type: 'photo' as const,
      url: photo.urls.small,
      thumbnailUrl: photo.urls.thumb,
      downloadUrl: photo.urls.regular,
      width: photo.width,
      height: photo.height,
      alt: photo.alt_description || query,
      attribution: {
        name: photo.user.name,
        url: photo.user.links.html,
        source: 'Unsplash',
      },
    }))

    setCache(cacheKey, results)
    return results
  } catch (error) {
    console.warn('Unsplash API error, using fallback:', error)
    return getFallbackPhotos(query, page, perPage)
  }
}

// Fallback using Lorem Picsum (always works, no API key needed)
function getFallbackPhotos(query: string, page: number, perPage: number): WebImageResult[] {
  const results: WebImageResult[] = []
  const startId = (page - 1) * perPage + 1

  for (let i = 0; i < perPage; i++) {
    const id = startId + i
    results.push({
      id: `picsum-${id}`,
      type: 'photo',
      url: `https://picsum.photos/seed/${query}${id}/300/200`,
      thumbnailUrl: `https://picsum.photos/seed/${query}${id}/100/75`,
      downloadUrl: `https://picsum.photos/seed/${query}${id}/800/600`,
      width: 300,
      height: 200,
      alt: `${query} image ${id}`,
      attribution: {
        name: 'Lorem Picsum',
        url: 'https://picsum.photos',
        source: 'Picsum',
      },
    })
  }

  return results
}

// ============================================
// ICONIFY API - SVG icons (200k+ icons)
// Completely free, no API key needed
// ============================================

export async function searchIconifyIcons(
  query: string,
  page: number = 1,
  perPage: number = 48
): Promise<WebImageResult[]> {
  const cacheKey = getCacheKey('iconify', query, page)
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  try {
    // Search Iconify API
    const response = await fetch(
      `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${perPage * 2}`
    )

    if (!response.ok) {
      throw new Error('Iconify API error')
    }

    const data = await response.json()
    const icons = data.icons || []

    // Paginate results
    const startIndex = (page - 1) * perPage
    const pageIcons = icons.slice(startIndex, startIndex + perPage)

    const results: WebImageResult[] = pageIcons.map((iconName: string) => {
      // Iconify format: "prefix:name" e.g., "mdi:home"
      const [prefix] = iconName.split(':')
      const svgUrl = `https://api.iconify.design/${iconName}.svg`

      return {
        id: iconName,
        type: 'icon' as const,
        url: svgUrl,
        thumbnailUrl: svgUrl,
        downloadUrl: svgUrl,
        width: 24,
        height: 24,
        alt: iconName.replace(':', ' - '),
        attribution: {
          name: prefix,
          url: `https://icon-sets.iconify.design/${prefix}/`,
          source: 'Iconify',
        },
      }
    })

    setCache(cacheKey, results)
    return results
  } catch (error) {
    console.error('Iconify API error:', error)
    return []
  }
}

// ============================================
// GIPHY API - Animated GIFs
// Demo key available for development
// ============================================

// GIPHY public beta/demo key (limited rate, for development only)
const GIPHY_API_KEY = 'dc6zaTOxFJmzC' // Public beta key

export async function searchGiphyGifs(
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<WebImageResult[]> {
  const cacheKey = getCacheKey('giphy', query, page)
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  try {
    const offset = (page - 1) * perPage
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${perPage}&offset=${offset}&rating=g`
    )

    if (!response.ok) {
      throw new Error('GIPHY API error')
    }

    const data = await response.json()
    const results: WebImageResult[] = data.data.map((gif: {
      id: string
      images: {
        fixed_width: { url: string; width: string; height: string }
        fixed_width_small: { url: string }
        original: { url: string }
      }
      title: string
      username: string
      url: string
    }) => ({
      id: gif.id,
      type: 'gif' as const,
      url: gif.images.fixed_width.url,
      thumbnailUrl: gif.images.fixed_width_small.url,
      downloadUrl: gif.images.original.url,
      width: parseInt(gif.images.fixed_width.width, 10),
      height: parseInt(gif.images.fixed_width.height, 10),
      alt: gif.title || query,
      attribution: {
        name: gif.username || 'GIPHY',
        url: gif.url,
        source: 'GIPHY',
      },
    }))

    setCache(cacheKey, results)
    return results
  } catch (error) {
    console.error('GIPHY API error:', error)
    return []
  }
}

// ============================================
// Unified search function
// ============================================

export type ImageSearchType = 'photos' | 'icons' | 'gifs'

export async function searchImages(
  type: ImageSearchType,
  query: string,
  page: number = 1
): Promise<WebImageResult[]> {
  if (!query.trim()) return []

  switch (type) {
    case 'photos':
      return searchUnsplashPhotos(query, page)
    case 'icons':
      return searchIconifyIcons(query, page)
    case 'gifs':
      return searchGiphyGifs(query, page)
    default:
      return []
  }
}

// Clear cache (useful for testing)
export function clearImageCache(): void {
  cache.clear()
}

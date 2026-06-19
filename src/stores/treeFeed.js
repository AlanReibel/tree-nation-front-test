import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Proxy config — vite proxies /bff to the real API so we avoid CORS.
// See vite.config.js → server.proxy
const FEED_ENDPOINT = '/bff/trees/feed'
const PAGE_LIMIT = 10
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// --- Simple in-memory cache per URL params ---
const responseCache = new Map()

function getCached(key) {
  const entry = responseCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    responseCache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key, data) {
  responseCache.set(key, { data, timestamp: Date.now() })
}

export const useTreeFeedStore = defineStore('treeFeed', () => {
  // --- State ---
  const trees = ref([])
  const page = ref(1)
  const isLoading = ref(false)
  const hasMore = ref(true)
  const error = ref(null)

  // --- Getters ---
  const isEmpty = computed(() =>
    !isLoading.value && trees.value.length === 0 && !hasMore.value,
  )

  // --- Actions ---

  /**
   * Fetch the next page and append to the tree list.
   * Uses an in-memory cache keyed by URL params to avoid redundant network
   * calls when pages are re-visited (e.g. after reset or re-mount).
   */
  async function loadMore() {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: page.value.toString(),
        limit: PAGE_LIMIT.toString(),
        isCollected: 'true',
        orderByField: 'created_at',
        sortDirection: 'DESC',
      })
      // types[] needs manual append — URLSearchParams object notation
      // doesn't handle repeated keys with array syntax.
      params.append('types[]', 'success_seed')
      params.append('types[]', 'tree')

      const cacheKey = params.toString()
      const cached = getCached(cacheKey)
      let items

      if (cached) {
        items = cached
      } else {
        const res = await fetch(`${FEED_ENDPOINT}?${params}`)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        items = Array.isArray(data) ? data : data.data ?? []

        setCache(cacheKey, items)
      }

      if (items.length === 0) {
        hasMore.value = false
        return
      }

      trees.value.push(...items)
      page.value++
    } catch (err) {
      error.value = err.message
      hasMore.value = false
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    trees.value = []
    page.value = 1
    hasMore.value = true
    isLoading.value = false
    error.value = null
  }

  return {
    trees,
    page,
    isLoading,
    hasMore,
    error,
    isEmpty,
    loadMore,
    reset,
  }
})

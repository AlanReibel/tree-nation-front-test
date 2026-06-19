# Pending Tasks — Tree Feed

## ✅ Implemented

| Feature | Files |
|---------|-------|
| Pinia store with pagination + cache | `src/stores/treeFeed.js` |
| IntersectionObserver infinite scroll | `src/composables/useInfiniteScroll.js` |
| TreeFeed container (loading, empty, error, sentinel, end states) | `src/components/TreeFeed.vue` |
| TreePost card with pre-fetch + skeleton + Instagram-style UI | `src/components/TreePost.vue` |
| Vite proxy (CORS workaround) | `vite.config.js` |
| CommentList (skeleton, accepts pre-fetched data) | `src/components/CommentList.vue` |
| LikeCount (presentational) | `src/components/LikeCount.vue` |
| LikeUserList (skeleton, accepts pre-fetched data) | `src/components/LikeUserList.vue` |

---

## 🗂️ Cache Strategy (already implemented)

An in-memory `Map` in the store caches API responses keyed by URL params:

```js
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached(key)   // returns null if expired or missing
function setCache(key, data)
```

- Each unique page request is cached individually
- Cache invalidates after 5 minutes
- On `reset()`, the cache survives (but page 1 re-fetch hits fresh or cached)

### Possible improvements
- Add a manual "Refresh" button that clears cache and re-fetches page 1
- Persist cache to `sessionStorage` so it survives page refresh within the tab

---

## 🔧 Other Improvements (low priority)

- Smooth scroll/transition animations on new items
- "Back to Top" button
- Debounce the sentinel trigger to avoid rapid fire
- Cache-bust on explicit user refresh
- Unit tests
- Accessible labels / ARIA

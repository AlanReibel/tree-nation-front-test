# Pending Tasks — Tree Feed

## ✅ Implemented

| Feature | Files |
|---------|-------|
| Pinia store with pagination + cache | `src/stores/treeFeed.js` |
| IntersectionObserver infinite scroll | `src/composables/useInfiniteScroll.js` |
| TreeFeed container (loading, empty, error, sentinel, end states) | `src/components/TreeFeed.vue` |
| TreePost card | `src/components/TreePost.vue` |
| Vite proxy (CORS workaround) | `vite.config.js` |

---

## 📋 Pending Components

### 1. `CommentList.vue`
- **Props**: `treeId` (number, required)
- **Data to fetch**: `GET /tree/getComments/{treeId}`
  - Returns all comments with `author` and `created_at`
  - Sort by `created_at` ascending (oldest first)
- **States**: loading, empty ("No comments yet"), error, list with items
- **Placement**: inside `TreePost`, toggled by a "Comments" button

### 2. `LikeCount.vue`
- **Props**: `likesCount` (number) — already available on each feed tree item
- **Display**: icon + count, e.g. `❤️ 42`
- **States**: shows `0` when no likes, handle gracefully when count is `null`/`undefined`

### 3. `LikeUserList.vue`
- **Props**: `treeId` (number, required)
- **Data to fetch**: `GET /tree/getLikes/{treeId}`
  - Returns list of users who liked, each with `created_at`
  - Sort by `created_at` ascending
- **States**: loading, empty, error, list with avatars/names
- **Placement**: toggled by clicking the LikeCount or a dedicated button

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

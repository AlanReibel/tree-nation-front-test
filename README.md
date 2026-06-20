# Tree Feed — Tree Nation Front Test

Social feed of planted trees with infinite scroll, comments, and likes.

Built with **Vue 3**, **Pinia**, and **Vite**.

CSS uses **native nesting** (max 3 levels) and **semantic class names** — no utility frameworks. Critical styles (reset, body, header, shared keyframes) are inlined in `index.html` to prevent FOUC on initial load.

---

## How to run

### Prerequisites

- Node.js ≥ 22

### Setup

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies `/bff/*` requests to the Tree Nation API — no CORS issues.

### Production build

```bash
npm run build
npm run preview
```

---

## Assumptions

### API discovery

The documented base URL (`https://youcannevertestenough.tree-nation.com/`) returns the company's marketing site, not the API. The actual API lives under `/bff`, discovered by inspecting network requests on the live site.

### Sorting

- **Feed** is ordered by `created_at DESC` (newest first), matching the requirement that items always sort by creation time.
- **Comments and likes** arrive already sorted by `created_at ASC` from the API — no client-side sort needed.

### Parameters

- `sortDirection` must be uppercase (`DESC`), lowercase (`desc`) is silently ignored.
- `types[]` requires bracket syntax with repeated keys: `types[]=success_seed&types[]=tree`.
- `isCollected=true` filters to collected trees only.

### Image failures

Many profile images from the S3 bucket return `AccessDenied` or are double-wrapped (the URL contains an encoded copy of itself). The app gracefully falls back to a generated SVG placeholder on error.

### Caching

- **Feed pages** are cached in-memory with a 5-minute TTL to avoid redundant network calls when revisiting pages.
- **Comments and likes** are cached per-post in component refs after first fetch (or pre-fetch).

### Pre-fetch strategy

Comments and likes are pre-fetched when a post stays in the viewport for ≥ 800ms (the user paused to read). If the user scrolls past quickly, the request is cancelled — no wasted bandwidth.

---

## App structure

```
public/
├── favicon.ico
└── assets/
    ├── tree-icon.png                 # Tree type icon in post header
    └── seed-icon.png                 # Seed type icon in post header

src/
├── main.js                          # Entry point — creates Vue app + Pinia
├── main.css                         # Global style reference (CSS loaded inline in index.html)
├── App.vue                          # Root layout with <main> container
│
├── stores/
│   └── treeFeed.js                  # Pinia store — pagination, cache, API calls
│
├── composables/
│   └── useInfiniteScroll.js         # IntersectionObserver sentinel for infinite scroll
│
├── utils/
│   ├── time.js                      # timeAgo() and formatScore() helpers
│   └── avatar.js                    # defaultAvatar(), unwrapProfileUrl(),
│                                    # formatPersonName(), onAvatarError()
│
└── components/
    ├── TreeFeed.vue                 # Feed container — loading (3× PostSkeleton), error, empty, sentinel
    ├── TreePost.vue                 # Post card — avatar, message, image, stats, comments toggle
    ├── PostSkeleton.vue             # Animated card skeleton (3 shown during initial load)
    ├── CommentList.vue              # Comments — skeleton, error, empty states
    ├── LikeUserList.vue             # Like users — chip list with skeleton states
    ├── LikesModal.vue               # Teleported popover modal with backdrop + Escape handler
    │
    └── icons/                       # Reusable SVG icon components (size prop via :size="N")
        ├── IconHeart.vue
        ├── IconComment.vue
        ├── IconDrops.vue
        ├── IconStar.vue
        ├── IconClose.vue
        ├── IconGift.vue
        ├── IconAlertCircle.vue
        ├── IconChevronUp.vue
        └── IconUser.vue
```

---

## API endpoints

All proxied through Vite under `/bff`. The actual base is `https://youcannevertestenough.tree-nation.com/bff`.

### `GET /bff/trees/feed`

Paginated list of trees.

| Param | Type | Notes |
|---|---|---|
| `page` | int | 1-based |
| `limit` | int | Items per page |
| `types[]` | string | Repeated: `success_seed`, `tree` |
| `isCollected` | bool | `true` |
| `orderByField` | string | `created_at` |
| `sortDirection` | string | `DESC` or `ASC` (must be uppercase) |

Response: `{ data: [ TreeItem, ... ] }`

### `GET /bff/tree/getComments/{treeId}`

All comments for a tree, sorted by `created_at` ASC.

Response: `{ data: [ { id, content, created_at, author: { full_name, profile_img } }, ... ] }`

### `GET /bff/tree/getLikes/{treeId}`

All users who liked a tree, sorted by `created_at` ASC.

Response: `{ data: [ { id, created_at, author: { full_name, profile_img } }, ... ] }`

---

## Features

- **Infinite scroll** with IntersectionObserver sentinel (600px advance margin)
- **Pre-fetch** of comments/likes on viewport dwell (800ms threshold)
- **Skeleton UI** — PostSkeleton for initial feed load (3 animated cards), inline skeletons for comments/likes matching exact API counters
- **Popover modal** for likes list (Teleported via LikesModal, scoped styles, closes on backdrop click / Escape)
- **Inline expand** for comments with grid-based 0fr/1fr height animation
- **Error, empty, and loading states** for every data-fetching component
- **S3 image fallback** with SVG placeholder (handles double-wrapped URLs and AccessDenied)
- **In-memory cache** with 5-minute TTL for feed pages
- **CSS native nesting** (max 3 levels) with role-based class names — no flat BEM or utility classes
- **FOUC-free** — critical CSS (reset, body, header, keyframes) inlined in index.html
- **Vite proxy** to bypass CORS during development

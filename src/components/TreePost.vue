<template>
  <article ref="postRef" class="tree-post">
    <!-- ─── Header: avatar + name + time ─── -->
    <div class="post-header">
      <img
        v-if="!avatarErrored"
        :src="avatarSrc"
        alt=""
        class="avatar"
        @error="avatarErrored = true"
      />
      <img
        v-else
        :src="defaultAvatar"
        alt=""
        class="avatar"
      />
      <div class="header-text">
        <span class="owner-name">{{ ownerName }}</span>
        <span class="time">{{ timeAgo(tree.created_at) }}</span>
      </div>
      <span v-if="tree.type === 'seed'" class="type-badge seed" title="This is a seed, not yet a tree">Seed</span>
      <span v-else class="type-badge tree">Tree</span>
    </div>

    <!-- ─── Recipient (gift) ─── -->
    <div v-if="tree.recipient_full_name" class="recipient-line">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 12H4M12 4v16" />
        <rect x="3" y="7" width="18" height="10" rx="2" />
      </svg>
      Gift for <strong>{{ tree.recipient_full_name }}</strong>
    </div>

    <!-- ─── Message ─── -->
    <p v-if="tree.message" class="message">{{ tree.message }}</p>

    <!-- ─── Image ─── -->
    <img
      v-if="tree.image && !imageErrored"
      :src="tree.image"
      alt="Tree photo"
      class="post-image"
      loading="lazy"
      @error="imageErrored = true"
    />

    <!-- ─── Stats row ─── -->
    <div class="post-stats">
      <span class="stat" title="Score">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        {{ formatScore(tree.score) }}
      </span>
      <span
        v-if="tree.likes_count != null"
        class="stat clickable"
        :class="{ 'stat-active': showLikes }"
        title="Likes"
        @click="showLikes = true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {{ tree.likes_count }}
      </span>
      <span
        v-if="tree.comments_count != null"
        class="stat clickable"
        :class="{ 'stat-active': showComments }"
        title="Comments"
        @click="showComments = !showComments"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {{ tree.comments_count }}
      </span>
      <span v-if="tree.drops_count > 0" class="stat" title="Drops">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        {{ tree.drops_count }}
      </span>
    </div>

    <!-- ─── Hashtag ─── -->
    <div v-if="tree.hashtag" class="hashtag-line">
      <span class="hashtag">#{{ tree.hashtag }}</span>
    </div>

    <!-- ─── Expanded comments ─── -->
    <transition name="expand">
      <div v-if="showComments" class="expanded-section">
        <CommentList
          :tree-id="tree.id"
          :data="prefetchedComments"
          :loading="prefetchingComments"
          :expected-count="tree.comments_count"
        />
      </div>
    </transition>

    <!-- ─── Likes popover modal ─── -->
    <Teleport to="body">
      <div v-if="showLikes" class="likes-backdrop" @click="showLikes = false">
        <div class="likes-modal" @click.stop>
          <div class="likes-modal-header">
            <h4>Likes</h4>
            <button class="close-btn" @click="showLikes = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <LikeUserList
            :tree-id="tree.id"
            :data="prefetchedLikes"
            :loading="prefetchingLikes"
            :expected-count="tree.likes_count"
          />
        </div>
      </div>
    </Teleport>
  </article>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { timeAgo, formatScore } from '@/utils/time'
import CommentList from './CommentList.vue'
import LikeUserList from './LikeUserList.vue'

const props = defineProps({
  tree: { type: Object, required: true },
})

// --- Toggle state for comments / likes panels ---
const showComments = ref(false)
const showLikes = ref(false)

// Close likes modal on Escape key
function onKeydown(e) {
  if (e.key === 'Escape' && showLikes.value) {
    showLikes.value = false
  }
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

// ─── Pre-fetch on viewport dwell ──────────────────────────────
// When a post stays in the viewport for ≥ 800ms (user paused to read),
// we pre-fetch comments and likes in the background.
// If the user clicks before it arrives, they see a skeleton instead of
// a spinner — the data loads shortly after.
const postRef = ref(null)
const prefetchedComments = ref(null)
const prefetchedLikes = ref(null)
const prefetchingComments = ref(false)
const prefetchingLikes = ref(false)

let preFetchTimer = null

function cancelPreFetch() {
  if (preFetchTimer) {
    clearTimeout(preFetchTimer)
    preFetchTimer = null
  }
}

async function fetchComments() {
  if (prefetchedComments.value !== null) return // already have data
  prefetchingComments.value = true
  try {
    const res = await fetch(`/bff/tree/getComments/${props.tree.id}`)
    const json = await res.json()
    prefetchedComments.value = Array.isArray(json.data) ? json.data : []
  } catch {
    prefetchedComments.value = [] // prevent retry on error
  } finally {
    prefetchingComments.value = false
  }
}

async function fetchLikes() {
  if (prefetchedLikes.value !== null) return // already have data
  prefetchingLikes.value = true
  try {
    const res = await fetch(`/bff/tree/getLikes/${props.tree.id}`)
    const json = await res.json()
    prefetchedLikes.value = Array.isArray(json.data) ? json.data : []
  } catch {
    prefetchedLikes.value = [] // prevent retry on error
  } finally {
    prefetchingLikes.value = false
  }
}

function startPreFetch() {
  if (prefetchedComments.value !== null && prefetchedLikes.value !== null) return
  fetchComments()
  fetchLikes()
}

// Observe this post: when it has been visibly intersecting for ≥ 800ms,
// start pre-fetching. If it scrolls out before that, cancel the timer.
useIntersectionObserver(
  postRef,
  ([entry]) => {
    if (entry?.isIntersecting) {
      cancelPreFetch()
      preFetchTimer = setTimeout(startPreFetch, 800)
    } else {
      cancelPreFetch()
    }
  },
  { threshold: 0.3 },
)

// --- Image error fallbacks ---
// Some S3 profile images return AccessDenied or are double-wrapped.
// On error we swap to a generated SVG placeholder.
const avatarErrored = ref(false)
const imageErrored = ref(false)

const defaultAvatar =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect fill="#e5e7eb" width="40" height="40" rx="20"/><circle fill="#9ca3af" cx="20" cy="16" r="6"/><path fill="#9ca3af" d="M8 34c0-6 5.5-10 12-10s12 4 12 10"/></svg>',
  )

/**
 * Some profile_img values come double-wrapped from the API:
 *   baseUrl/https%3A//baseUrl/actual-path
 * This extracts and decodes the inner URL.
 * Falls back to the raw URL if no wrapping is detected.
 */
function unwrapProfileUrl(url) {
  if (!url) return null
  const match = url.match(/https%3A\/\/([^#?]+)/i)
  if (match) {
    return decodeURIComponent(`https://${match[1]}`)
  }
  return url
}

const avatarSrc = computed(() => {
  const raw = props.tree.owner?.profile_img
  return raw ? unwrapProfileUrl(raw) : defaultAvatar
})

const ownerName = computed(() => {
  const o = props.tree.owner
  if (!o) return 'Anonymous'
  return [o.first_name, o.last_name].filter(Boolean).join(' ') || 'Anonymous'
})
</script>

<style scoped>
.tree-post {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem 1.125rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
  transition: box-shadow 0.15s;
}

.tree-post:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ─── Header ─── */
.post-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #e5e7eb;
}

.header-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.owner-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.type-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.type-badge.seed {
  background: #fef3c7;
  color: #92400e;
}

.type-badge.tree {
  background: #d1fae5;
  color: #065f46;
}

/* ─── Recipient ─── */
.recipient-line {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.recipient-line strong {
  color: #374151;
}

/* ─── Message ─── */
.message {
  margin: 0;
  font-size: 0.9375rem;
  color: #1f2937;
  line-height: 1.5;
  white-space: pre-line;
}

/* ─── Image ─── */
.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 0.625rem;
  background: #f3f4f6;
}

/* ─── Stats ─── */
.post-stats {
  display: flex;
  gap: 1.25rem;
  padding-top: 0.25rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.stat.clickable {
  cursor: pointer;
  transition: color 0.15s;
}

.stat.clickable:hover {
  color: #374151;
}

.stat.stat-active {
  color: #2563eb;
}

.stat svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* ─── Hashtag ─── */
.hashtag-line {
  padding-top: 0.125rem;
}

.hashtag {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #2563eb;
}

/* ─── Expanded comments ─── */
.expanded-section {
  padding: 0;
  border-top: 1px solid #f3f4f6;
}

/* ─── Expand transition ─── */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* ─── Likes popover modal ─── */
.likes-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  animation: fadeIn 0.15s ease;
}

.likes-modal {
  width: 90%;
  max-width: 380px;
  max-height: 70vh;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn 0.15s ease;
}

.likes-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.likes-modal-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.likes-modal :deep(.like-list) {
  overflow-y: auto;
  padding: 0.75rem 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>

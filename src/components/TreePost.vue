<template>
  <article class="tree-post">
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
      <span v-if="tree.likes_count != null" class="stat" title="Likes">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {{ tree.likes_count }}
      </span>
      <span v-if="tree.comments_count != null" class="stat" title="Comments">
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
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { timeAgo, formatScore } from '@/utils/time'

const props = defineProps({
  tree: { type: Object, required: true },
})

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
</style>

<template>
  <div class="comment-list">
    <!-- Loading skeleton -->
    <div v-if="loading" class="cl-skeleton">
      <div v-for="i in 3" :key="i" class="skeleton-row">
        <div class="skeleton-avatar" />
        <div class="skeleton-lines">
          <div class="skeleton-line short" />
          <div class="skeleton-line long" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="cl-state error">
      <span>Failed to load comments.</span>
    </div>

    <!-- Empty -->
    <div v-else-if="items.length === 0" class="cl-state empty">
      <span>No comments yet.</span>
    </div>

    <!-- List -->
    <div v-else class="cl-items">
      <div v-for="c in items" :key="c.id" class="comment">
        <img
          :src="c.author?.profile_img || defaultAvatar"
          alt=""
          class="comment-avatar"
          @error="onAvatarError($event)"
        />
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">{{ c.author?.full_name || 'Anonymous' }}</span>
            <span class="comment-time">{{ timeAgo(c.created_at) }}</span>
          </div>
          <p class="comment-content">{{ c.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { timeAgo } from '@/utils/time'

const props = defineProps({
  /** Tree ID to fetch comments for (used when data prop is not provided) */
  treeId: { type: Number, default: null },
  /** Pre-fetched comments — when provided, skips the internal fetch */
  data: { type: Array, default: null },
  /** Whether the parent is still loading pre-fetched data */
  loading: { type: Boolean, default: false },
})

const defaultAvatar =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 40 40"><rect fill="#e5e7eb" width="40" height="40" rx="20"/><circle fill="#9ca3af" cx="20" cy="16" r="6"/><path fill="#9ca3af" d="M8 34c0-6 5.5-10 12-10s12 4 12 10"/></svg>',
  )

// If data prop is provided, use it directly (parent pre-fetched).
// Otherwise, the parent must handle the fetch and pass loading/data.
const items = computed(() => props.data ?? [])
const error = computed(() => false)

function onAvatarError(e) {
  e.target.src = defaultAvatar
}
</script>

<style scoped>
.comment-list {
  padding: 0.75rem 0 0;
}

/* ─── Skeleton ─── */
.cl-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 0.5rem 0;
}

.skeleton-row {
  display: flex;
  gap: 0.625rem;
  align-items: flex-start;
}

.skeleton-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  flex-shrink: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding-top: 4px;
}

.skeleton-line {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line.short {
  width: 40%;
}

.skeleton-line.long {
  width: 85%;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ─── States ─── */
.cl-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  color: #9ca3af;
}

.cl-state.error {
  color: #dc2626;
}

/* ─── Items ─── */
.cl-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment {
  display: flex;
  gap: 0.625rem;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #e5e7eb;
  margin-top: 2px;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.125rem;
}

.comment-author {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
}

.comment-time {
  font-size: 0.6875rem;
  color: #9ca3af;
}

.comment-content {
  margin: 0;
  font-size: 0.8125rem;
  color: #374151;
  line-height: 1.45;
  white-space: pre-line;
  word-break: break-word;
}
</style>

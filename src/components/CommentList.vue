<template>
  <div class="comment-list">
    <!-- Loading skeleton: match the known expected count (capped at 5) -->
    <div v-if="loading" class="cl-skeleton">
      <div v-for="i in skeletonCount" :key="i" class="row">
        <div class="avatar" />
        <div class="lines">
          <div class="line short" />
          <div class="line long" />
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
          :src="c.author?.profile_img || defaultAvatar(32)"
          alt=""
          class="avatar"
          @error="onAvatarError($event, 32)"
        />
        <div class="body">
          <div class="header">
            <span class="author">{{ c.author?.full_name || 'Anonymous' }}</span>
            <span class="time">{{ timeAgo(c.created_at) }}</span>
          </div>
          <p class="content">{{ c.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { timeAgo } from '@/utils/time'
import { defaultAvatar, onAvatarError } from '@/utils/avatar'

const props = defineProps({
  /** Tree ID to fetch comments for (used when data prop is not provided) */
  treeId: { type: Number, default: null },
  /** Pre-fetched comments — when provided, skips the internal fetch */
  data: { type: Array, default: null },
  /** Whether the parent is still loading pre-fetched data */
  loading: { type: Boolean, default: false },
  /** Expected count from the feed item — used to render matching skeletons */
  expectedCount: { type: Number, default: 0 },
})

// Show as many skeletons as the expected count, max 5 to avoid clutter
const skeletonCount = computed(() => Math.min(Math.max(props.expectedCount, 1), 5))

// If data prop is provided, use it directly (parent pre-fetched).
// Otherwise, the parent must handle the fetch and pass loading/data.
const items = computed(() => props.data ?? [])
const error = computed(() => false)
</script>

<style scoped>
.comment-list {
  padding: 0.75rem 0 0;

  .cl-state {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    font-size: 0.8125rem;
    color: #9ca3af;

    &.error {
      color: #dc2626;
    }
  }

  .cl-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}

.cl-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 0.5rem 0;
  
  .row {
    display: flex;
    gap: 0.625rem;
    align-items: flex-start;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e5e7eb;
    flex-shrink: 0;
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  .lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding-top: 4px;
  }
  
  .line {
    height: 12px;
    background: #e5e7eb;
    border-radius: 6px;
    animation: pulse 1.5s ease-in-out infinite;
  
    &.short {
      width: 40%;
    }
  
    &.long {
      width: 85%;
    }
  }
}

/* ─── Comment items ─── */
.comment {
  display: flex;
  gap: 0.625rem;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: #e5e7eb;
    margin-top: 2px;
  }

  .body {
    flex: 1;
    min-width: 0;
  }
  
  .header {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.125rem;
  
    .author {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #111827;
    }
  
    .time {
      font-size: 0.6875rem;
      color: #9ca3af;
    }
  }
  
  .content {
    margin: 0;
    font-size: 0.8125rem;
    color: #374151;
    line-height: 1.45;
    white-space: pre-line;
    word-break: break-word;
  }
}


</style>

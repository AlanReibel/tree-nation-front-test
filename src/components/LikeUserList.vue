<template>
  <div class="like-list">
    <!-- Loading skeleton: match the known expected count (capped at 8) -->
    <div v-if="loading" class="ll-skeleton">
      <div v-for="i in skeletonCount" :key="i" class="skeleton-chip">
        <div class="skeleton-avatar" />
        <div class="skeleton-name" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="ll-state error">
      <span>Failed to load likes.</span>
    </div>

    <!-- Empty -->
    <div v-else-if="items.length === 0" class="ll-state empty">
      <span>No likes yet.</span>
    </div>

    <!-- List -->
    <div v-else class="ll-items">
      <div v-for="u in items" :key="u.id" class="like-user">
        <img
          :src="u.author?.profile_img || defaultAvatar(28)"
          alt=""
          class="user-avatar"
          @error="onAvatarError($event, 28)"
        />
        <span class="user-name">{{ u.author?.full_name || 'Anonymous' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { defaultAvatar, onAvatarError } from '@/utils/avatar'

const props = defineProps({
  /** Tree ID to fetch likes for (used when data prop is not provided) */
  treeId: { type: Number, default: null },
  /** Pre-fetched likes — when provided, skips the internal fetch */
  data: { type: Array, default: null },
  /** Whether the parent is still loading pre-fetched data */
  loading: { type: Boolean, default: false },
  /** Expected count from the feed item — used to render matching skeletons */
  expectedCount: { type: Number, default: 0 },
})

// Show as many skeletons as the expected count, max 8 to avoid clutter
const skeletonCount = computed(() => Math.min(Math.max(props.expectedCount, 1), 8))

const items = computed(() => props.data ?? [])
const error = computed(() => false)
</script>

<style scoped>
.like-list {
  padding: 0;
}

/* ─── Skeleton ─── */
.ll-skeleton {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.skeleton-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem 0.25rem 0.25rem;
  background: #f3f4f6;
  border-radius: 999px;
}

.skeleton-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e5e7eb;
  flex-shrink: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-name {
  width: 64px;
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ─── States ─── */
.ll-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  color: #9ca3af;
}

.ll-state.error {
  color: #dc2626;
}

/* ─── Items ─── */
.ll-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.like-user {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem 0.25rem 0.25rem;
  background: #f3f4f6;
  border-radius: 999px;
  font-size: 0.8125rem;
  color: #374151;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #e5e7eb;
}

.user-name {
  font-weight: 500;
}
</style>

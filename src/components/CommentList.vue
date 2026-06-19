<template>
  <div class="comment-list">
    <!-- Loading -->
    <div v-if="loading" class="cl-state">
      <div class="spinner-sm" />
      <span>Loading comments…</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="cl-state error">
      <span>Failed to load comments.</span>
    </div>

    <!-- Empty -->
    <div v-else-if="comments.length === 0" class="cl-state empty">
      <span>No comments yet.</span>
    </div>

    <!-- List -->
    <div v-else class="cl-items">
      <div v-for="c in comments" :key="c.id" class="comment">
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
import { ref, onMounted } from 'vue'
import { timeAgo } from '@/utils/time'

const props = defineProps({
  treeId: { type: Number, required: true },
})

const defaultAvatar =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 40 40"><rect fill="#e5e7eb" width="40" height="40" rx="20"/><circle fill="#9ca3af" cx="20" cy="16" r="6"/><path fill="#9ca3af" d="M8 34c0-6 5.5-10 12-10s12 4 12 10"/></svg>',
  )

const comments = ref([])
const loading = ref(true)
const error = ref(false)

function onAvatarError(e) {
  e.target.src = defaultAvatar
}

onMounted(async () => {
  try {
    const res = await fetch(`/bff/tree/getComments/${props.treeId}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    comments.value = Array.isArray(json.data) ? json.data : []
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.comment-list {
  padding: 0.75rem 0 0;
}

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

/* Small spinner for inline use */
.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

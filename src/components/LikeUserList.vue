<template>
  <div class="like-list">
    <!-- Loading -->
    <div v-if="loading" class="ll-state">
      <div class="spinner-sm" />
      <span>Loading likes…</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="ll-state error">
      <span>Failed to load likes.</span>
    </div>

    <!-- Empty -->
    <div v-else-if="users.length === 0" class="ll-state empty">
      <span>No likes yet.</span>
    </div>

    <!-- List -->
    <div v-else class="ll-items">
      <div v-for="u in users" :key="u.id" class="like-user">
        <img
          :src="u.author?.profile_img || defaultAvatar"
          alt=""
          class="user-avatar"
          @error="onAvatarError($event)"
        />
        <span class="user-name">{{ u.author?.full_name || 'Anonymous' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  treeId: { type: Number, required: true },
})

const defaultAvatar =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 40 40"><rect fill="#e5e7eb" width="40" height="40" rx="20"/><circle fill="#9ca3af" cx="20" cy="16" r="6"/><path fill="#9ca3af" d="M8 34c0-6 5.5-10 12-10s12 4 12 10"/></svg>',
  )

const users = ref([])
const loading = ref(true)
const error = ref(false)

function onAvatarError(e) {
  e.target.src = defaultAvatar
}

onMounted(async () => {
  try {
    const res = await fetch(`/bff/tree/getLikes/${props.treeId}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    users.value = Array.isArray(json.data) ? json.data : []
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.like-list {
  padding: 0.5rem 0 0;
}

.ll-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: #9ca3af;
}

.ll-state.error {
  color: #dc2626;
}

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

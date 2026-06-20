<template>
  <section class="tree-feed">
    <!-- Loading skeleton (initial) -->
    <div v-if="!initialLoadDone" class="feed-list">
      <PostSkeleton v-for="n in 3" :key="n" />
    </div>

    <!-- Error state -->
    <div v-else-if="store.error" class="state-message error">
      <IconAlertCircle :size="24" />
      <span>{{ store.error }}</span>
      <button class="retry-btn" @click="retry">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="store.isEmpty" class="state-message empty">
      <IconUser :size="24" />
      <span>No trees found.</span>
    </div>

    <!-- Feed list -->
    <template v-else>
      <TransitionGroup name="feed-item" tag="div" class="feed-list">
        <TreePost v-for="(tree, idx) in store.trees" :key="tree.id ?? idx" :tree="tree" />
      </TransitionGroup>

      <!-- Sentinel: triggers loadMore when visible -->
      <div v-if="store.hasMore" ref="sentinel" class="sentinel">
        <div v-if="store.isLoading" class="sentinel-loading">
          <div class="spinner" />
          <span>Loading more...</span>
        </div>
      </div>

      <div v-else class="end-message">
        — All trees loaded —
      </div>
    </template>

    <!-- Back to Top button -->
    <Transition name="back-top">
      <button v-if="scrollY > 400" class="back-top" @click="scrollToTop" title="Back to top">
        <IconChevronUp />
      </button>
    </Transition>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTreeFeedStore } from '@/stores/treeFeed'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import IconAlertCircle from '@/components/icons/IconAlertCircle.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconChevronUp from '@/components/icons/IconChevronUp.vue'
import TreePost from './TreePost.vue'
import PostSkeleton from './PostSkeleton.vue'

const store = useTreeFeedStore()

// storeToRefs preserves reactivity — Pinia auto-unwraps refs on the store
// object, so store.isLoading / store.hasMore would be plain booleans.
// We need the actual refs for the composable.
const { isLoading, hasMore } = storeToRefs(store)

const initialLoadDone = ref(false)

async function loadInitial() {
  await store.loadMore()
  initialLoadDone.value = true
}

async function retry() {
  store.reset()
  await loadInitial()
}

// Wire the sentinel to loadMore
// Pass refs (from storeToRefs), not unwrapped values.
const { target: sentinel } = useInfiniteScroll(
  () => store.loadMore(),
  isLoading,
  hasMore,
)

onMounted(() => {
  loadInitial()
})

// ─── Back to Top ────────────────────────────────
const scrollY = ref(0)
function onScroll() {
  scrollY.value = window.scrollY
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.tree-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .feed-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
  }

  .state-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 3rem 1rem;
    text-align: center;
    color: #6b7280;

    &.error {
      color: #dc2626;
    }
  }

  .retry-btn {
    margin-top: 0.5rem;
    padding: 0.5rem 1.25rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background: #fff;
    cursor: pointer;
    font-size: 0.875rem;

    &:hover {
      background: #f9fafb;
    }
  }

  .sentinel {
    display: flex;
    justify-content: center;
    padding: 1rem 0;

    .sentinel-loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #9ca3af;
    }
  }

  .end-message {
    text-align: center;
    font-size: 0.875rem;
    color: #9ca3af;
    padding: 1rem 0;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

/* ─── Feed item enter animation (transition classes, root) ─── */
.feed-item-enter-active {
  transition: all 0.35s ease-out;
}

.feed-item-enter-from {
  opacity: 0;
  transform: translateY(24px);
}

/* ─── Fixed back-to-top ─── */
.back-top {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: #1f2937;
  color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 900;
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: #374151;
    transform: scale(1.05);
  }
}

.back-top-enter-active,
.back-top-leave-active {
  transition: all 0.25s ease;
}

.back-top-enter-from,
.back-top-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

</style>

<template>
  <article ref="postRef" class="tree-post">
    <!-- ─── Header: avatar + name + planted label ─── -->
    <header>
      <img
        v-if="!avatarErrored"
        :src="avatarSrc"
        alt=""
        class="avatar"
        width="36"
        height="36"
        @error="avatarErrored = true"
      />
      <img v-else :src="defaultAvatar(36)" alt="" class="avatar" />
      <div class="header-text">
        <span class="owner-name">
          {{ ownerName }}<span class="locale-flag">{{ localeFlag }}</span>
        </span>
        <span class="planted-line">
          planted {{ tree.quantity }} {{ typeLabel }}
        </span>
      </div>
      <!-- Type icon -->
      <div class="type">
        <small>{{ tree.quantity }}</small>
        <img
          v-if="tree.type === 'seed'"
          src="/assets/seed-icon.png"
          alt="Seed"
          width="34"
          height="34"
        />
        <img
          v-else
          src="/assets/tree-icon.png"
          alt="Tree"
          width="34"
          height="34"
        />
      </div>
    </header>

    <!-- ─── Recipient (gift) ─── -->
    <div v-if="tree.recipient_full_name" class="recipient-line">
      <IconGift :size="14" />
      Gift for <strong>{{ tree.recipient_full_name }}</strong>
    </div>

    <!-- ─── Message ─── -->
    <p v-if="tree.message">{{ tree.message }}</p>

    <!-- ─── Image ─── -->
    <img
      v-if="tree.image && !imageErrored"
      :src="tree.image"
      alt="Tree photo"
      loading="lazy"
      @error="imageErrored = true"
    />

    <!-- ─── Stats row: interactions left, metadata right ─── -->
    <footer>
      <span class="stat-group">
        <span
          v-if="tree.likes_count != null"
          class="stat clickable"
          :class="{ 'stat-active': showLikes }"
          title="Likes"
          @click="showLikes = true"
        >
          <IconHeart :size="16" />
          {{ tree.likes_count }}
        </span>
        <span
          v-if="tree.comments_count != null"
          class="stat clickable"
          :class="{ 'stat-active': showComments }"
          title="Comments"
          @click="showComments = !showComments"
        >
          <IconComment :size="16" />
          {{ tree.comments_count }}
        </span>
        <span v-if="tree.drops_count > 0" class="stat" title="Drops">
          <IconDrops :size="16" />
          {{ tree.drops_count }}
        </span>
      </span>

      <span class="stat-meta">
        <span class="stat date-stat">{{ formattedDate }}</span>
        <span class="stat score-stat" title="Score">
          <IconStar :size="14" />
          {{ formatScore(tree.score) }}
        </span>
      </span>
    </footer>

    <!-- ─── Hashtag ─── -->
    <p v-if="tree.hashtag" class="hashtag">#{{ tree.hashtag }}</p>

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
          <div class="header">
            <h4>Likes</h4>
            <button class="close btn-icon" @click="showLikes = false">
              <IconClose :size="18" />
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
import { formatScore } from '@/utils/time'
import { defaultAvatar, unwrapProfileUrl, formatPersonName } from '@/utils/avatar'
import IconHeart from '@/components/icons/IconHeart.vue'
import IconComment from '@/components/icons/IconComment.vue'
import IconDrops from '@/components/icons/IconDrops.vue'
import IconStar from '@/components/icons/IconStar.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconGift from '@/components/icons/IconGift.vue'
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
  if (prefetchedComments.value !== null) return
  prefetchingComments.value = true
  try {
    const res = await fetch(`/bff/tree/getComments/${props.tree.id}`)
    const json = await res.json()
    prefetchedComments.value = Array.isArray(json.data) ? json.data : []
  } catch {
    prefetchedComments.value = []
  } finally {
    prefetchingComments.value = false
  }
}

async function fetchLikes() {
  if (prefetchedLikes.value !== null) return
  prefetchingLikes.value = true
  try {
    const res = await fetch(`/bff/tree/getLikes/${props.tree.id}`)
    const json = await res.json()
    prefetchedLikes.value = Array.isArray(json.data) ? json.data : []
  } catch {
    prefetchedLikes.value = []
  } finally {
    prefetchingLikes.value = false
  }
}

function startPreFetch() {
  if (prefetchedComments.value !== null && prefetchedLikes.value !== null) return
  fetchComments()
  fetchLikes()
}

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
const avatarErrored = ref(false)
const imageErrored = ref(false)

const avatarSrc = computed(() => {
  const raw = props.tree.owner?.profile_img
  return raw ? unwrapProfileUrl(raw) : defaultAvatar(36)
})

const ownerName = computed(() => formatPersonName(props.tree.owner))

const typeLabel = computed(() => {
  const t = props.tree.type
  const plural = props.tree.quantity !== 1
  if (t === 'tree') return plural ? 'Trees' : 'Tree'
  return plural ? 'Seeds' : 'Seed'
})

const formattedDate = computed(() => {
  if (!props.tree.created_at) return ''
  const d = new Date(props.tree.created_at)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const localeFlag = computed(() => {
  const locale = props.tree.owner?.locale
  const flags = { en: '🇬🇧', pt: '🇵🇹', fr: '🇫🇷', it: '🇮🇹' }
  return flags[locale] || ''
})
</script>

<style scoped>
article {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem 1.125rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* ── Header ── */
  header {
    display: flex;
    align-items: center;
    gap: 0.625rem;

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

      .owner-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: #111827;
        line-height: 1.3;

        .locale-flag {
          margin-left: 0.25rem;
          font-size: 0.875rem;
          vertical-align: middle;
        }
      }

      .planted-line {
        font-size: 0.75rem;
        color: #6b7280;
        line-height: 1.3;
      }
    }
  }

  /* ── Recipient ── */
  .recipient-line {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    color: #6b7280;

    strong {
      color: #374151;
    }
  }

  /* ── Message — único <p> en el artículo ── */
  p {
    margin: 0;
    font-size: 0.9375rem;
    color: #1f2937;
    line-height: 1.5;
    white-space: pre-line;
  }

  /* ── Post image — direct child, no afecta avatar del header ── */
  > img {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 0.625rem;
    background: #f3f4f6;
  }

  /* ── Stats / footer ── */
  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.25rem;

    .stat-group {
      display: flex;
      gap: 1.25rem;
    }

    .stat-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8125rem;
      color: #6b7280;

      &.clickable {
        cursor: pointer;
        transition: color 0.15s;

        &:hover {
          color: #374151;
        }
      }

      &.stat-active {
        color: #2563eb;
      }
    }

    .date-stat {
      font-size: 0.75rem;
      color: #9ca3af;
    }
  }

  /* ── Hashtag ── */
  .hashtag {
    padding-top: 0.125rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #2563eb;
  }

  /* ── Expanded comments ── */
  .expanded-section {
    padding: 0;
    border-top: 1px solid #f3f4f6;
  }
}

/* ─── Expand transition (no se puede anidar, va al root) ─── */
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

/* ─── Likes modal (teleportado al body) ─── */
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

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #f3f4f6;

    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
    }

    .close {
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

      &:hover {
        background: #e5e7eb;
        color: #374151;
      }
    }
  }

  :deep(.like-list) {
    overflow-y: auto;
    padding: 0.75rem 1rem;
  }
}

</style>

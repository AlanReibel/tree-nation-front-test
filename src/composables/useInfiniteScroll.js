import { shallowRef, onMounted, onUnmounted } from 'vue'

/**
 * Observes a sentinel element and calls `onLoadMore` when it becomes visible.
 *
 * Extracted from flanks-front-challenge (NewsList.vue) — same IntersectionObserver
 * sentinel pattern, no VueUse dependency needed.
 *
 * @param {Function} onLoadMore  Callback to fetch the next page
 * @param {Ref<boolean>} isLoading  Reactive flag to prevent overlapping loads
 * @param {Ref<boolean>} hasMore  Reactive flag to stop observing when done
 * @param {Object} [options]
 * @param {string} [options.rootMargin='600px']  Advance trigger margin
 * @param {number} [options.threshold=0.5]  Visibility threshold
 * @returns {{ target: ShallowRef<HTMLElement|null> }}
 */
export function useInfiniteScroll(onLoadMore, isLoading, hasMore, options = {}) {
  const { rootMargin = '600px', threshold = 0.5 } = options
  const target = shallowRef(null)
  let observer = null

  function setupObserver() {
    if (!target.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isLoading.value && hasMore.value) {
          onLoadMore()
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(target.value)
  }

  onMounted(() => {
    // Wait a tick so the sentinel is in the DOM
    requestAnimationFrame(() => setupObserver())
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { target }
}

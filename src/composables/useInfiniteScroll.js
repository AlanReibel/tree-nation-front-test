import { shallowRef, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

/**
 * Observes a sentinel element and calls `onLoadMore` when it becomes visible.
 *
 * Uses `useIntersectionObserver` from VueUse — handles the timing edge cases
 * (target appearing/disappearing from the DOM) without manual watch logic.
 *
 * @param {Function} onLoadMore  Callback to fetch the next page
 * @param {import('vue').Ref<boolean>} isLoading  Reactive ref — prevents overlapping loads
 * @param {import('vue').Ref<boolean>} hasMore  Reactive ref — stops observation when false
 * @param {Object} [options]
 * @param {string} [options.rootMargin='600px']  Advance trigger margin
 * @param {number} [options.threshold=0.5]  Visibility threshold
 * @returns {{ target: import('vue').ShallowRef<HTMLElement|null> }}
 */
export function useInfiniteScroll(onLoadMore, isLoading, hasMore, options = {}) {
  const { rootMargin = '600px', threshold = 0.5 } = options
  const target = shallowRef(null)

  const { stop } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting && !isLoading.value && hasMore.value) {
        console.log('[useInfiniteScroll] ⏬ triggering loadMore')
        onLoadMore()
      }
    },
    {
      rootMargin,
      threshold,
    },
  )

  onUnmounted(() => {
    stop()
  })

  return { target }
}

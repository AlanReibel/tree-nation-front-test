<template>
  <span class="like-count" :title="`${count} likes`">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
    <span class="count">{{ count ?? 0 }}</span>
  </span>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 0 },
})
</script>

<style scoped>
.like-count {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.like-count svg {
  flex-shrink: 0;
}

.count {
  font-variant-numeric: tabular-nums;
}
</style>

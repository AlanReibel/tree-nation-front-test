<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20 12H4M12 4v16" />
    <rect x="3" y="7" width="18" height="10" rx="2" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 14 },
})
</script>

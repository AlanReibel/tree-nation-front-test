<script setup>
import TreeFeed from "@/components/TreeFeed.vue";
</script>

<template>
  <main class="container">
    <TreeFeed />
  </main>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, sans-serif;
  background: #f3f4f6;
  color: #1f2937;
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 680px;
  margin: 0 auto;
}

main {
  padding: 1.5rem 0;
}

header {
  padding: .5rem 0;

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>

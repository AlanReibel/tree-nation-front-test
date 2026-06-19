<script setup>
import TreeFeed from '@/components/TreeFeed.vue'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Tree Feed</h1>
      <p class="subtitle">Latest trees from Tree Nation</p>
    </header>
    <main class="app-main">
      <TreeFeed />
    </main>
  </div>
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  background: #f3f4f6;
  color: #1f2937;
  -webkit-font-smoothing: antialiased;
}

.app {
  max-width: 680px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.app-header {
  margin-bottom: 1.5rem;
}

.app-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>

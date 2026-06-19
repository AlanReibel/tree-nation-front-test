<template>
  <article class="tree-post">
    <div class="tree-header">
      <h3 class="tree-title">{{ tree.name }}</h3>
      <span class="tree-species">{{ tree.species }}</span>
    </div>

    <p v-if="tree.description" class="tree-description">
      {{ tree.description }}
    </p>

    <div class="tree-meta">
      <span class="tree-score" title="Score">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        {{ tree.score ?? '—' }}
      </span>

      <span class="tree-age" title="Age">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {{ tree.age ? `${tree.age} days` : '—' }}
      </span>

      <span class="tree-country" v-if="tree.country">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {{ tree.country }}
      </span>
    </div>
  </article>
</template>

<script setup>
defineProps({
  tree: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.tree-post {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}

.tree-post:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.tree-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.tree-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a2e;
}

.tree-species {
  font-size: 0.875rem;
  font-style: italic;
  color: #6b7280;
}

.tree-description {
  margin: 0;
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.5;
}

.tree-meta {
  display: flex;
  gap: 1.25rem;
  margin-top: 0.25rem;
}

.tree-meta span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.tree-meta svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>

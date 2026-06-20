<template>
  <article class="post-skeleton">
    <header>
      <div class="avatar" />
      <div class="text">
        <div class="line" />
        <div class="line short" />
      </div>
      <div class="type" />
    </header>

    <div class="message" />

    <div class="image" />

    <footer>
      <div class="group">
        <div class="stat" />
        <div class="stat" />
      </div>
      <div class="group narrow">
        <div class="stat" />
        <div class="stat" />
      </div>
    </footer>
  </article>
</template>

<style scoped>
.post-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem 1.125rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);

  header {
    display: flex;
    align-items: center;
    gap: 0.625rem;

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #e5e7eb;
      flex-shrink: 0;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;

      .line {
        height: 12px;
        width: 140px;
        background: #e5e7eb;
        border-radius: 6px;
        animation: pulse 1.5s ease-in-out infinite;

        &.short {
          width: 100px;
        }
      }
    }

    .type {
      width: 34px;
      height: 34px;
      border-radius: 0.5rem;
      background: #e5e7eb;
      flex-shrink: 0;
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  .message {
    height: 14px;
    width: 65%;
    background: #e5e7eb;
    border-radius: 6px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .image {
    width: 100%;
    height: 200px;
    border-radius: 0.625rem;
    background: #e5e7eb;
    animation: pulse 1.5s ease-in-out infinite;
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.25rem;

    .group {
      display: flex;
      gap: 1.25rem;

      &.narrow {
        gap: 0.75rem;
      }
    }

    .stat {
      width: 48px;
      height: 16px;
      background: #e5e7eb;
      border-radius: 6px;
      animation: pulse 1.5s ease-in-out infinite;
    }
  }
}
</style>

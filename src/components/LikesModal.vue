<template>
  <Teleport to="body">
    <div class="likes" @click="$emit('close')">
      <div class="modal" @click.stop>
        <div class="header">
          <h4>Likes</h4>
          <button class="close" @click="$emit('close')">
            <IconClose :size="18" />
          </button>
        </div>
        <LikeUserList
          :tree-id="treeId"
          :data="prefetchedLikes"
          :loading="prefetchingLikes"
          :expected-count="likesCount"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import IconClose from "@/components/icons/IconClose.vue";
import LikeUserList from "./LikeUserList.vue";

defineProps({
  treeId: { type: Number, required: true },
  likesCount: { type: Number, default: 0 },
  prefetchedLikes: { type: Array, default: null },
  prefetchingLikes: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

function onKeydown(e) {
  if (e.key === "Escape") {
    emit("close");
  }
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
.likes {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  animation: fadeIn 0.15s ease;

  .modal {
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
}


</style>

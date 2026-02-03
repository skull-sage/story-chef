<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <q-btn
        flat
        round
        icon="text_fields"
        color="primary"
        class="toolbar-btn"
        @click="$emit('add-text')"
      >
        <q-tooltip anchor="center right" self="center left">Add Text</q-tooltip>
        <q-badge
          color="accent"
          floating
          rounded
          class="add-badge"
        >
          <q-icon name="add" size="8px" />
        </q-badge>
      </q-btn>
      <q-btn
        flat
        round
        icon="image"
        color="primary"
        class="toolbar-btn"
        @click="$emit('add-image')"
      >
        <q-tooltip anchor="center right" self="center left">Add Image</q-tooltip>
        <q-badge
          color="accent"
          floating
          rounded
          class="add-badge"
        >
          <q-icon name="add" size="8px" />
        </q-badge>
      </q-btn>
    </div>

    <q-separator inset />

    <q-space />

    <div class="toolbar-section">
      <q-btn
        flat
        round
        icon="download"
        color="positive"
        @click="$emit('export')"
      >
        <q-tooltip anchor="center right" self="center left">Export</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // Empty for now, simplified
}

interface Emits {
  (e: 'add-text'): void;
  (e: 'add-image'): void;
  (e: 'export'): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

// Minimal toolbar logic
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 8px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  width: 64px;
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

:deep(.add-badge) {
  opacity: 0.5;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.toolbar-btn:hover :deep(.add-badge) {
  opacity: 1;
  transform: scale(1.1);
}
</style>

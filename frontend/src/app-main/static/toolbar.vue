<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <q-btn
        flat
        icon="text_fields"
        label="Add Text"
        color="primary"
        @click="$emit('add-text')"
      />
      <q-btn
        flat
        icon="image"
        label="Add Image"
        color="primary"
        @click="$emit('add-image')"
      />
    </div>

    <q-separator vertical inset />

    <div class="toolbar-section">
      <q-select
        v-model="selectedSize"
        :options="canvasSizes"
        option-label="label"
        option-value="value"
        label="Canvas Size"
        dense
        outlined
        style="min-width: 180px"
        @update:model-value="$emit('change-canvas-size', $event.value)"
      />
    </div>

    <q-separator vertical inset />

    <div class="toolbar-section">
      <q-btn
        flat
        icon="undo"
        @click="$emit('undo')"
        :disable="!canUndo"
      >
        <q-tooltip>Undo</q-tooltip>
      </q-btn>
      <q-btn
        flat
        icon="redo"
        @click="$emit('redo')"
        :disable="!canRedo"
      >
        <q-tooltip>Redo</q-tooltip>
      </q-btn>
    </div>

    <q-space />

    <div class="toolbar-section">
      <q-btn
        flat
        icon="download"
        label="Export"
        color="positive"
        @click="$emit('export')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Size } from './types';

interface CanvasSizeOption {
  label: string;
  value: Size;
}

interface Props {
  canUndo?: boolean;
  canRedo?: boolean;
}

interface Emits {
  (e: 'add-text'): void;
  (e: 'add-image'): void;
  (e: 'change-canvas-size', size: Size): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'export'): void;
}

const props = withDefaults(defineProps<Props>(), {
  canUndo: false,
  canRedo: false
});

const emit = defineEmits<Emits>();

const canvasSizes: CanvasSizeOption[] = [
  { label: 'Instagram Post (1080x1080)', value: { width: 1080, height: 1080 } },
  { label: 'Instagram Story (1080x1920)', value: { width: 1080, height: 1920 } },
  { label: 'Facebook Post (1200x630)', value: { width: 1200, height: 630 } },
  { label: 'Twitter Post (1200x675)', value: { width: 1200, height: 675 } },
  { label: 'LinkedIn Post (1200x627)', value: { width: 1200, height: 627 } }
];

const selectedSize = ref<CanvasSizeOption>(canvasSizes[0]);
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

<template>
  <div class="top-bar">
    <div class="top-bar-section">
      <q-btn-dropdown
        flat
        no-caps
        dense
        label="Canvas Size"
        class="size-dropdown"
      >
        <q-list style="min-width: 200px">
          <q-item
            v-for="size in canvasSizes"
            :key="size.label"
            clickable
            v-close-popup
            @click="selectSize(size)"
            :active="currentSize.width === size.value.width && currentSize.height === size.value.height"
          >
            <q-item-section>
              <q-item-label>{{ size.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <div class="current-size-label text-caption text-grey-7">
        {{ currentLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Size } from './types';

interface CanvasSizeOption {
  label: string;
  value: Size;
}

interface Props {
  currentSize: Size;
}

interface Emits {
  (e: 'change-canvas-size', size: Size): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const canvasSizes: CanvasSizeOption[] = [
  { label: 'Instagram Post (1080x1080)', value: { width: 1080, height: 1080 } },
  { label: 'Instagram Story (1080x1920)', value: { width: 1080, height: 1920 } },
  { label: 'Facebook Post (1200x630)', value: { width: 1200, height: 630 } },
  { label: 'Twitter Post (1200x675)', value: { width: 1200, height: 675 } },
  { label: 'LinkedIn Post (1200x627)', value: { width: 1200, height: 627 } }
];

const currentLabel = computed(() => {
  const match = canvasSizes.find(s =>
    s.value.width === props.currentSize.width &&
    s.value.height === props.currentSize.height
  );
  return match ? match.label : `${props.currentSize.width} x ${props.currentSize.height}`;
});

const selectSize = (size: CanvasSizeOption) => {
  emit('change-canvas-size', size.value);
};
</script>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.top-bar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.size-dropdown {
  font-weight: 500;
}
</style>

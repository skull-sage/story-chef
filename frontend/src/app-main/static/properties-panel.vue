<template>
  <div v-if="selectedNode" class="properties-panel">
    <div class="panel-header">
      <div class="text-h6">Properties</div>
      <q-btn
        flat
        dense
        round
        icon="close"
        @click="$emit('close')"
      />
    </div>

    <q-separator />

    <!-- Common Properties -->
    <div class="property-section">
      <div class="section-title">Position & Size</div>

      <div class="property-row">
        <q-input
          :model-value="selectedNode.position.x"
          label="X"
          type="number"
          dense
          outlined
          @update:model-value="updatePosition('x', $event)"
        />
        <q-input
          :model-value="selectedNode.position.y"
          label="Y"
          type="number"
          dense
          outlined
          @update:model-value="updatePosition('y', $event)"
        />
      </div>

      <div class="property-row">
        <q-input
          :model-value="selectedNode.size.width"
          label="Width"
          type="number"
          dense
          outlined
          @update:model-value="updateSize('width', $event)"
        />
        <q-input
          :model-value="selectedNode.size.height"
          label="Height"
          type="number"
          dense
          outlined
          @update:model-value="updateSize('height', $event)"
        />
      </div>
    </div>

    <q-separator />

    <!-- Text Node Properties -->
    <div v-if="selectedNode.type === 'text'" class="property-section">
      <div class="section-title">Text Properties</div>

      <q-select
        :model-value="selectedNode.fontSize"
        :options="fontSizes"
        label="Font Size"
        dense
        outlined
        @update:model-value="updateTextProperty('fontSize', $event)"
      />

      <q-input
        :model-value="selectedNode.fontFamily"
        label="Font Family"
        dense
        outlined
        @update:model-value="updateTextProperty('fontFamily', $event)"
      />

      <q-input
        :model-value="selectedNode.color"
        label="Color"
        type="color"
        dense
        outlined
        @update:model-value="updateTextProperty('color', $event)"
      />

      <q-select
        :model-value="selectedNode.textAlign"
        :options="['left', 'center', 'right']"
        label="Text Align"
        dense
        outlined
        @update:model-value="updateTextProperty('textAlign', $event)"
      />

      <div class="property-row">
        <q-btn-toggle
          :model-value="selectedNode.fontWeight"
          :options="[
            { label: 'Normal', value: 'normal' },
            { label: 'Bold', value: 'bold' }
          ]"
          dense
          @update:model-value="updateTextProperty('fontWeight', $event)"
        />
      </div>

      <div class="property-row">
        <q-btn-toggle
          :model-value="selectedNode.fontStyle"
          :options="[
            { label: 'Normal', value: 'normal' },
            { label: 'Italic', value: 'italic' }
          ]"
          dense
          @update:model-value="updateTextProperty('fontStyle', $event)"
        />
      </div>

      <q-input
        :model-value="selectedNode.lineHeight"
        label="Line Height"
        type="number"
        step="0.1"
        dense
        outlined
        @update:model-value="updateTextProperty('lineHeight', parseFloat($event))"
      />

      <q-input
        :model-value="selectedNode.letterSpacing"
        label="Letter Spacing"
        type="number"
        dense
        outlined
        @update:model-value="updateTextProperty('letterSpacing', parseFloat($event))"
      />
    </div>

    <!-- Image Node Properties -->
    <div v-if="selectedNode.type === 'image'" class="property-section">
      <div class="section-title">Image Properties</div>

      <q-input
        :model-value="selectedNode.filters.brightness"
        label="Brightness"
        type="number"
        min="0"
        max="200"
        dense
        outlined
        @update:model-value="updateImageFilter('brightness', parseFloat($event))"
      />

      <q-input
        :model-value="selectedNode.filters.contrast"
        label="Contrast"
        type="number"
        min="0"
        max="200"
        dense
        outlined
        @update:model-value="updateImageFilter('contrast', parseFloat($event))"
      />

      <q-input
        :model-value="selectedNode.filters.saturation"
        label="Saturation"
        type="number"
        min="0"
        max="200"
        dense
        outlined
        @update:model-value="updateImageFilter('saturation', parseFloat($event))"
      />

      <q-input
        :model-value="selectedNode.borderRadius"
        label="Border Radius"
        type="number"
        dense
        outlined
        @update:model-value="updateImageProperty('borderRadius', parseFloat($event))"
      />

      <q-input
        :model-value="selectedNode.borderWidth"
        label="Border Width"
        type="number"
        dense
        outlined
        @update:model-value="updateImageProperty('borderWidth', parseFloat($event))"
      />

      <q-input
        :model-value="selectedNode.borderColor"
        label="Border Color"
        type="color"
        dense
        outlined
        @update:model-value="updateImageProperty('borderColor', $event)"
      />
    </div>

    <q-separator />

    <!-- Actions -->
    <div class="property-section">
      <q-btn
        flat
        color="negative"
        icon="delete"
        label="Delete"
        class="full-width"
        @click="$emit('delete-node', selectedNode.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GraphicNode, TextNode, ImageNode } from './types';

interface Props {
  selectedNode: GraphicNode | null;
}

interface Emits {
  (e: 'update:node', node: GraphicNode): void;
  (e: 'delete-node', id: string): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fontSizes = [14, 16, 20, 24, 30, 36];

const updatePosition = (axis: 'x' | 'y', value: string) => {
  if (!props.selectedNode) return;

  const updatedNode = {
    ...props.selectedNode,
    position: {
      ...props.selectedNode.position,
      [axis]: parseFloat(value)
    }
  };
  emit('update:node', updatedNode);
};

const updateSize = (dimension: 'width' | 'height', value: string) => {
  if (!props.selectedNode) return;

  const updatedNode = {
    ...props.selectedNode,
    size: {
      ...props.selectedNode.size,
      [dimension]: parseFloat(value)
    }
  };
  emit('update:node', updatedNode);
};

const updateTextProperty = (property: keyof TextNode, value: any) => {
  if (!props.selectedNode || props.selectedNode.type !== 'text') return;

  const updatedNode = {
    ...props.selectedNode,
    [property]: value
  };
  emit('update:node', updatedNode);
};

const updateImageProperty = (property: keyof ImageNode, value: any) => {
  if (!props.selectedNode || props.selectedNode.type !== 'image') return;

  const updatedNode = {
    ...props.selectedNode,
    [property]: value
  };
  emit('update:node', updatedNode);
};

const updateImageFilter = (filter: 'brightness' | 'contrast' | 'saturation', value: number) => {
  if (!props.selectedNode || props.selectedNode.type !== 'image') return;

  const updatedNode = {
    ...props.selectedNode,
    filters: {
      ...props.selectedNode.filters,
      [filter]: value
    }
  };
  emit('update:node', updatedNode);
};
</script>

<style scoped>
.properties-panel {
  width: 300px;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.property-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #424242;
  margin-bottom: 8px;
}

.property-row {
  display: flex;
  gap: 8px;
}
</style>

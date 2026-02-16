<template>
  <div class="debug-panel">
    <div v-if="selectionState?.domSelection" class="prop-list">

      <div class="prop-item">
        <span class="label">Type:</span>
        <span class="value">{{ selectionState.domSelection.type }}</span>
      </div>
      <div class="prop-item">
        <span class="label">Range Count:</span>
        <span class="value">{{ selectionState.domSelection.rangeCount }}</span>
      </div>
      <div class="prop-item">
        <span class="label">Is Collapsed:</span>
        <span class="value">{{ selectionState.domSelection.isCollapsed }}</span>
      </div>

      <hr class="separator" />

      <div class="node-info">
        <div class="text-teal-9 q-mb-sm">Anchor (Start)</div>
        <div v-if="selectionState.domSelection.anchorNode">
          <span class="text-blue-8">{{ selectionState.domSelection.anchorNode.nodeName }}</span>
          <span class="bg-blue-grey-1" v-if="selectionState.domSelection.anchorNode.nodeValue">
            {{ formatValue(selectionState.domSelection.anchorNode.nodeValue) }}
          </span>
        </div>
        <div>
          <span class="text-blue-8">Offset</span> {{ selectionState.domSelection.anchorOffset }}
        </div>
      </div>

      <hr class="separator" />
      <div class="node-info">
        <div class="text-teal-9 q-mb-sm">Focus (End)</div>
        <div v-if="selectionState.domSelection.focusNode">
          <span class="text-blue-8">{{ selectionState.domSelection.focusNode.nodeName }}</span>
          <span class="bg-blue-grey-1" v-if="selectionState.domSelection.focusNode.nodeValue">
             {{ formatValue(selectionState.domSelection.focusNode.nodeValue) }}
          </span>
        </div>
        <div>
          <span class="text-blue-8">Offset</span> {{ selectionState.domSelection.focusOffset }}
        </div>
      </div>

    </div>
    <div v-else class="empty-state">
      No selection active
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{
  selectionState: any
}>();

const formatValue = (val: string) => {
  if (!val) return '';
  return val.length > 20 ? val.substring(0, 20) + '...' : val;
}
</script>

<style scoped>
.debug-panel {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  font-size: 0.9rem;
}

.prop-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prop-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 2px 0;
}

.label {
  font-weight: 600;
  color: #555;
  margin-right: 12px;
  flex-shrink: 0;
}

.value {
  color: #222;
  font-family: monospace;
  background: rgba(0,0,0,0.03);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prop-value {
    max-width: 200px;
    display: inline-block;
    vertical-align: bottom;
}

.value.code {
  color: #d63384;
}

.separator {
  border: 0;
  border-top: 1px solid #e9ecef;
  margin: 12px 0;
}

.node-info {
    background: white;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #eaeaea;
}

.node-info h4 {
  margin: 0 0 8px 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  font-weight: 700;
}

.empty-state {
  color: #999;
  text-align: center;
  padding: 20px;
  font-style: italic;
}
</style>

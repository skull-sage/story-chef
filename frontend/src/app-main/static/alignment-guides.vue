<template>
  <div class="alignment-guides">
    <div
      v-for="(guide, index) in guides"
      :key="index"
      :class="['guide', guide.type]"
      :style="getGuideStyle(guide)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlignmentGuide } from './types';

interface Props {
  guides: AlignmentGuide[];
}

const props = defineProps<Props>();

const getGuideStyle = (guide: AlignmentGuide) => {
  if (guide.type === 'vertical') {
    return {
      left: `${guide.position}px`,
      top: '0',
      bottom: '0',
      width: '1px'
    };
  } else {
    return {
      top: `${guide.position}px`,
      left: '0',
      right: '0',
      height: '1px'
    };
  }
};
</script>

<style scoped>
.alignment-guides {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

.guide {
  position: absolute;
  background-color: #ff00ff;
  opacity: 0.8;
  animation: guideFadeIn 0.2s ease-out;
}

.guide.vertical {
  width: 1px;
}

.guide.horizontal {
  height: 1px;
}

@keyframes guideFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.8;
  }
}
</style>

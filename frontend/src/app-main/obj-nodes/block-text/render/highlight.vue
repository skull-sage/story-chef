<template>
  <mark :class="[node.mark.styleClz]" :style="{ backgroundColor: node.mark.color }">{{ node.text }}</mark>
</template>

<script setup lang="ts">
import type { InlineText } from '../text-types';
import type { MarkHighlight } from '../text-types';

const props = defineProps<{
  node: InlineText & { mark: MarkHighlight }
}>();

</script>

<style scoped>
 .bg-line {
   border-radius: 2px;
 }
</style>

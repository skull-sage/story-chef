<template>
  <mark :class="[node.mark.styleClz]" :style="{ backgroundColor: node.mark.color }">{{ node.text }}</mark>
</template>

<script setup lang="ts">
import type { InlineText } from '../text-inline';
import type { MarkHighlight } from '../mark-inline';

const props = defineProps<{
  node: InlineText & { mark: MarkHighlight }
}>();

</script>

<style scoped>
 .bg-line {
   border-radius: 2px;
 }
</style>

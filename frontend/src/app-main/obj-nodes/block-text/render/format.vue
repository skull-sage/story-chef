<template>
  <strong v-if="node.mark.format === 'bold'">{{ node.text }}</strong>
  <em v-else-if="node.mark.format === 'italic'">{{ node.text }}</em>
  <code v-else-if="node.mark.format === 'code'">{{ node.text }}</code>
</template>

<script setup lang="ts">
import type { InlineText } from '../text-types';
import type { MarkFormat } from '../text-types';

const props = defineProps<{
  node: InlineText & { mark: MarkFormat }
}>();
</script>

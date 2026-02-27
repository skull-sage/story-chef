<template>
  <span v-if="node.mark == undefined">{{ node.text }}</span>
  <template v-else-if="node.mark.type=='format'">
    <strong v-if="node.mark.format === 'bold'">{{ node.text }}</strong>
    <em v-else-if="node.mark.format === 'italic'">{{ node.text }}</em>
    <code v-else-if="node.mark.format === 'code'">{{ node.text }}</code>
  </template>
  <template v-else-if="node.mark.type=='highlight'">
    <mark :class="[node.mark.styleClz]" :style="{ backgroundColor: node.mark.color }">{{ node.text }}</mark>
  </template>
</template>

<script setup lang="ts">
import { unescape } from 'querystring';
import type { InlineText } from '../text-types';

defineProps<{ node: InlineText }>();
</script>

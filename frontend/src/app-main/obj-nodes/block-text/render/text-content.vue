<script setup lang="ts">
import { h } from 'vue';
import type { InlineType, InlineText, InlineAtom } from '../text-types';
import NodeText from './node-text.vue';
import AnAtom from './an-atom.vue';

const props = defineProps<{
  content: InlineType[]
}>();

const RenderContent = () => {
  return (props.content || []).map((item, idx) => {
    if ('text' in item) {
      return h(NodeText, { key: idx, node: item as InlineText });
    } else {
      return h(AnAtom, { key: idx, node: item as InlineAtom });
    }
  });
};
</script>

<template>
  <RenderContent />
</template>

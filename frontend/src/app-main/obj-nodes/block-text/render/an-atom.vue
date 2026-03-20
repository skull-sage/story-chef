<template><span class="atom-element" contenteditable="false">{{ node.name }}</span></template>
<script setup lang="ts">
import type { InlineAtom } from '../text-types';
// NOTE: atom is not editable, and it is crucial for template tag not to have any space
defineProps<{ node: InlineAtom }>();
</script>

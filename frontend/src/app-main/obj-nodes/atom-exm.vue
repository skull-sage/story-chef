<template>
  <span class="cursor-pointer">
    {{ modelValue }}
    <q-popup-edit v-model="localText" v-slot="scope" auto-save>
      <q-input
        v-model="scope.value"
        dense
        autofocus
        @keyup.enter="scope.set"
      />
    </q-popup-edit>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localText = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})
</script>

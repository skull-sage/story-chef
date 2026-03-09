<template>
  <div>{{ changeCounter }}: {{ JSON.stringify(modelValue) }}</div>
</template>
<script lang="ts" setup>
import { onBeforeUpdate, ref } from 'vue';


const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
const changeCounter = ref(0);

onBeforeUpdate(() => {
  console.log('child onBeforeUpdate');
   changeCounter.value++;
});

</script>

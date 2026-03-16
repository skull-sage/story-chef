<template>
  <div class="dom-selection-demo">
    <div class="row">
      <div class="col-8">
        <div class="text-bold q-mb-md">Interactive Content</div>
        <BlockText v-model="textNode" ref="blockTextRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef } from "vue";
import BlockText from "./block-text/render/index.vue";
import { basicSample as sampleBlockText } from "./data-samples/block-text";


const textNode = undefined; // shallowRef(sampleBlockText);


</script>

<style scoped>
.dom-selection-demo {
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
}




</style>

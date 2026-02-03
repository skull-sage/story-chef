<script setup >
 
</script>

<template>
  <div class="flex flex-center q-mt-xl">
    <stage-layout style="width: 600px"  >
      <template #input>
        <div class="bg-amber-1 full-height" ref="dom-canvas"></div>
      </template>
      <template #output>
        <canvas></canvas>
      </template>
    </stage-layout>
  </div>
  <div class="flex flex-center q-pa-md">
    <a-btn action primary label="Play Animation" />
    <a-btn action primary label="Play Recorded" />
  </div>

</template>

<style scoped>

</style>
